import { BarChart3 } from "lucide-react";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { PhasePendingPanel } from "@/components/shared/phase-pending-panel";

export default function AnalyticsPage() {
  return (
    <>
      <AppPageHeader title="Analytics" description="Deep visitor, device, and peak-hour reporting." />
      <PhasePendingPanel
        icon={BarChart3}
        title="Full Analytics Suite"
        description="Device breakdowns, peak-hour heatmaps, and per-product funnels land in Phase 5 — Analytics Engine, built on the AnalyticsEvent table already in the schema."
        phase="Phase 5"
      />
    </>
  );
}
