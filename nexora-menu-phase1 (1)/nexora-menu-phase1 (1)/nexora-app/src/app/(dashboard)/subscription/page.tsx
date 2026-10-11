import { CreditCard } from "lucide-react";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { PhasePendingPanel } from "@/components/shared/phase-pending-panel";

export default function SubscriptionPage() {
  return (
    <>
      <AppPageHeader title="Subscription" description="Plan, billing history, and payment method." />
      <PhasePendingPanel
        icon={CreditCard}
        title="Stripe Billing Portal"
        description="Plan upgrades, invoices, and the Stripe customer portal connect in Phase 2 — Billing & Subscriptions."
        phase="Phase 2"
      />
    </>
  );
}
