import { Settings } from "lucide-react";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { PhasePendingPanel } from "@/components/shared/phase-pending-panel";

export default function SettingsPage() {
  return (
    <>
      <AppPageHeader title="Settings" description="Account, team members, and workspace preferences." />
      <PhasePendingPanel
        icon={Settings}
        title="Account & Team Settings"
        description="Staff roles (via RestaurantMember), password/email management, and workspace preferences ship in Phase 6 — Account & Team."
        phase="Phase 6"
      />
    </>
  );
}
