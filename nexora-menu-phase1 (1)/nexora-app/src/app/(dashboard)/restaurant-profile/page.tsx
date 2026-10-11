import { UserCircle } from "lucide-react";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { PhasePendingPanel } from "@/components/shared/phase-pending-panel";

export default function RestaurantProfilePage() {
  return (
    <>
      <AppPageHeader title="Restaurant Profile" description="Branding, branches, hours, and contact details." />
      <PhasePendingPanel
        icon={UserCircle}
        title="Restaurant Profile form"
        description="Logo upload, branch management, working hours, and social links wire up in Phase 3 — Restaurant Profile & Branches."
        phase="Phase 3"
      />
    </>
  );
}
