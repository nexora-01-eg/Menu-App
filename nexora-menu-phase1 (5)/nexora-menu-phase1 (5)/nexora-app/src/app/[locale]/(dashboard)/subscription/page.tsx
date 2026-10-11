import { CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentRestaurant } from "@/lib/tenant";
import { limitsFor } from "@/lib/limits";
import { plans } from "@/config/plans";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton, ManageBillingButton } from "@/components/subscription/billing-actions";

const STATUS_META = {
  ACTIVE: { label: "Active", variant: "success" as const, icon: CheckCircle2 },
  TRIALING: { label: "Trial", variant: "blue" as const, icon: Clock },
  PAST_DUE: { label: "Payment failed", variant: "neutral" as const, icon: AlertTriangle },
  CANCELED: { label: "Canceled", variant: "neutral" as const, icon: XCircle },
  INCOMPLETE: { label: "Incomplete", variant: "neutral" as const, icon: AlertTriangle },
};

export default async function SubscriptionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const withLocale = (path: string) => (locale === "en" ? path : `/${locale}${path}`);

  const ctx = await getCurrentRestaurant();
  if (!ctx) redirect(withLocale("/login"));

  const subscription = await prisma.subscription.findUnique({
    where: { restaurantId: ctx.restaurant.id },
  });

  const currentPlan = subscription?.plan ?? "FREE";
  const status = subscription?.status ?? "ACTIVE";
  const limits = limitsFor(currentPlan);
  const statusMeta = STATUS_META[status];

  const [productCount, branchCount, qrCount] = await Promise.all([
    prisma.product.count({ where: { restaurantId: ctx.restaurant.id } }),
    prisma.branch.count({ where: { restaurantId: ctx.restaurant.id } }),
    prisma.qrCode.count({ where: { restaurantId: ctx.restaurant.id } }),
  ]);

  return (
    <>
      <AppPageHeader title="Subscription" description="Plan, billing history, and payment method." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              Current plan
            </span>
            <Badge variant={statusMeta.variant} className="gap-1">
              <statusMeta.icon className="h-3 w-3" />
              {statusMeta.label}
            </Badge>
          </div>
          <div className="mb-1 font-display text-[28px] font-medium capitalize">
            {currentPlan.toLowerCase()}
          </div>
          {subscription?.currentPeriodEnd && (
            <p className="mb-5 text-[12.5px] text-muted-foreground">
              {status === "CANCELED" ? "Access ends" : "Renews"} on{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}

          <div className="mb-5 flex flex-col gap-3 border-t border-white/[0.08] pt-5">
            <UsageRow label="Products" used={productCount} limit={limits.maxProducts} />
            <UsageRow label="Branches" used={branchCount} limit={limits.maxBranches} />
            <UsageRow label="QR Codes" used={qrCount} limit={limits.maxQrCodes} />
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-muted-foreground">Analytics</span>
              <span className="font-semibold">{limits.hasAnalytics ? "Included" : "Not included"}</span>
            </div>
          </div>

          {subscription?.stripeCustomerId && <ManageBillingButton />}
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {plans
            .filter((p) => p.id !== "enterprise")
            .map((plan) => {
              const isCurrent = plan.id.toUpperCase() === currentPlan;
              return (
                <Card key={plan.id} className={isCurrent ? "border-gold/40 p-5" : "p-5"}>
                  <CardHeader className="p-0 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      {isCurrent && <Badge variant="gold">Current</Badge>}
                    </div>
                    <CardDescription>
                      {plan.price === 0 ? "Free forever" : `$${plan.price}/mo`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="mb-4 flex flex-col gap-1.5">
                      {plan.features.map((f) => (
                        <li key={f} className="text-[12px] text-muted-foreground">
                          · {f}
                        </li>
                      ))}
                    </ul>
                    {!isCurrent && plan.price !== 0 && (
                      <UpgradeButton planId={plan.id} label={`Switch to ${plan.name}`} />
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>
    </>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">
          {used} {limit !== null ? `/ ${limit}` : "· Unlimited"}
        </span>
      </div>
      {limit !== null && (
        <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : "bg-gold"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
