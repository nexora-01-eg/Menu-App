"use server";

import { getLocale } from "next-intl/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { priceIdForPlan, planTierFromPriceId } from "@/lib/stripe-plans";
import { siteConfig } from "@/config/site";

export interface BillingActionResult {
  ok: boolean;
  url?: string;
  error?: string;
}

const TRIAL_DAYS = 14;

/**
 * Starts a Stripe Checkout session for a paid plan. Reuses the
 * restaurant's existing Stripe customer if one exists (so payment
 * methods and invoice history stay attached to the same customer
 * across plan changes), otherwise creates one on the fly.
 */
export async function createCheckoutSessionAction(planId: string): Promise<BillingActionResult> {
  const priceId = priceIdForPlan(planId);
  if (!priceId) {
    return { ok: false, error: "This plan isn't available for self-serve checkout." };
  }

  const { restaurant, userId } = await requireCurrentRestaurant();

  const supabaseUser = await prisma.user.findUnique({ where: { id: userId } });
  const subscription = await prisma.subscription.findUnique({ where: { restaurantId: restaurant.id } });

  let customerId = subscription?.stripeCustomerId ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: supabaseUser?.email,
      name: restaurant.name,
      metadata: { restaurantId: restaurant.id },
    });
    customerId = customer.id;
  }

  // Only offer a trial the first time a restaurant ever subscribes to
  // a paid plan — not on every upgrade/downgrade between paid tiers.
  const isFirstSubscription = !subscription?.stripeSubscriptionId;
  const locale = await getLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: restaurant.id,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: isFirstSubscription ? { trial_period_days: TRIAL_DAYS } : undefined,
    success_url: `${siteConfig.url}${localePrefix}/subscription?checkout=success`,
    cancel_url: `${siteConfig.url}${localePrefix}/subscription?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  if (!session.url) return { ok: false, error: "Could not start checkout." };
  return { ok: true, url: session.url };
}

/**
 * Opens the Stripe-hosted Customer Portal, which natively covers
 * upgrade, downgrade, cancel, payment-method updates, and invoice
 * history — so we don't hand-roll any of those flows.
 */
export async function createPortalSessionAction(): Promise<BillingActionResult> {
  const { restaurant } = await requireCurrentRestaurant();

  const subscription = await prisma.subscription.findUnique({ where: { restaurantId: restaurant.id } });
  if (!subscription?.stripeCustomerId) {
    return { ok: false, error: "No billing account yet — subscribe to a plan first." };
  }

  const locale = await getLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${siteConfig.url}${localePrefix}/subscription`,
  });

  return { ok: true, url: session.url };
}

/** Re-syncs our Subscription row from Stripe on demand — used as a manual "Refresh status" fallback if a webhook was ever missed. */
export async function refreshSubscriptionStatusAction(): Promise<BillingActionResult> {
  const { restaurant } = await requireCurrentRestaurant();
  const subscription = await prisma.subscription.findUnique({ where: { restaurantId: restaurant.id } });

  if (!subscription?.stripeSubscriptionId) {
    return { ok: true }; // nothing to sync — still on Free
  }

  const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
  const priceId = stripeSub.items.data[0]?.price.id;

  await prisma.subscription.update({
    where: { restaurantId: restaurant.id },
    data: {
      plan: planTierFromPriceId(priceId),
      status: mapStripeStatus(stripeSub.status),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
  });

  return { ok: true };
}

function mapStripeStatus(
  status: string,
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
