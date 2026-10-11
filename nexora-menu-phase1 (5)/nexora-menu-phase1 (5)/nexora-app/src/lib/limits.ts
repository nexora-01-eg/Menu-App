import type { PlanTier } from "@prisma/client";

export interface PlanLimits {
  maxProducts: number | null; // null = unlimited
  maxQrCodes: number | null;
  maxBranches: number | null;
  hasAnalytics: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: { maxProducts: 20, maxQrCodes: 1, maxBranches: 1, hasAnalytics: false },
  STARTER: { maxProducts: 100, maxQrCodes: 5, maxBranches: 1, hasAnalytics: true },
  PRO: { maxProducts: null, maxQrCodes: null, maxBranches: 3, hasAnalytics: true },
  BUSINESS: { maxProducts: null, maxQrCodes: null, maxBranches: null, hasAnalytics: true },
  ENTERPRISE: { maxProducts: null, maxQrCodes: null, maxBranches: null, hasAnalytics: true },
};

export function limitsFor(plan: PlanTier): PlanLimits {
  return PLAN_LIMITS[plan];
}
