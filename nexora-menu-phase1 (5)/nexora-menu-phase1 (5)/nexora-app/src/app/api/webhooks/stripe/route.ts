import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { planTierFromPriceId } from "@/lib/stripe-plans";

/**
 * Stripe webhook endpoint — the single source of truth that keeps our
 * `Subscription` table in sync with what Stripe actually thinks is
 * happening (checkout completed, plan changed, payment failed,
 * subscription canceled). The dashboard never trusts client-side
 * "I just paid" state; it waits for this to land.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const restaurantId = session.client_reference_id;
        if (!restaurantId || !session.subscription || !session.customer) break;

        const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = stripeSub.items.data[0]?.price.id;

        await prisma.subscription.upsert({
          where: { restaurantId },
          create: {
            restaurantId,
            plan: planTierFromPriceId(priceId),
            status: mapStripeStatus(stripeSub.status),
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSub.id,
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          },
          update: {
            plan: planTierFromPriceId(priceId),
            status: mapStripeStatus(stripeSub.status),
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSub.id,
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            plan: planTierFromPriceId(priceId),
            status: mapStripeStatus(sub.status),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { plan: "FREE", status: "CANCELED" },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: "PAST_DUE" },
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Surface a 500 so Stripe retries delivery — swallowing this
    // would let our Subscription table silently drift from reality.
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" {
  switch (status) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}
