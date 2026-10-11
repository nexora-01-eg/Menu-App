import { Percent } from "lucide-react";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { PhasePendingPanel } from "@/components/shared/phase-pending-panel";

export default function OffersPage() {
  return (
    <>
      <AppPageHeader title="Offers" description="Happy hour windows, coupons, and promo banners." />
      <PhasePendingPanel
        icon={Percent}
        title="Offers & Promotions"
        description="Happy Hour scheduling, coupon codes, and banner management arrive in Phase 4 — Offers & Promotions."
        phase="Phase 4"
      />
    </>
  );
}
