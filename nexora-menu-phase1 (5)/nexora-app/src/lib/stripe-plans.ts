import type { PlanTier } from "@prisma/client";
import { plans } from "@/config/plans";

/**
 * Reverse-lookup: given a Stripe Price ID (from a subscription or
 * checkout session), find which of our Plan configs it belongs to,
 * and return the matching Prisma PlanTier. Falls back to "FREE" if
 * the price isn't recognized — better to under-grant than silently
 * treat an unknown price as a paid tier.
 */
export function planTierFromPriceId(priceId: string | null | undefined): PlanTier {
  if (!priceId) return "FREE";

  for (const plan of plans) {
    if (!plan.priceIdEnvVar) continue;
    const envValue = process.env[plan.priceIdEnvVar];
    if (envValue && envValue === priceId) {
      return plan.id.toUpperCase() as PlanTier;
    }
  }
  return "FREE";
}

/** The Stripe Price ID configured for a given plan, or null (Free/Enterprise have none). */
export function priceIdForPlan(planId: string): string | null {
  const plan = plans.find((p) => p.id === planId);
  if (!plan?.priceIdEnvVar) return null;
  return process.env[plan.priceIdEnvVar] ?? null;
}
