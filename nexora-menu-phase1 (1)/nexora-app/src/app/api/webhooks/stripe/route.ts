import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

/**
 * Stripe webhook endpoint. Signature verification is wired now so the
 * route is safe to point Stripe at as soon as keys exist; the actual
 * event handling (sync Subscription rows via Prisma) is Phase 2 work.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "invoice.payment_failed":
      // TODO (Phase 2 — Billing): upsert the Subscription row via
      // prisma keyed on stripeCustomerId / stripeSubscriptionId.
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
