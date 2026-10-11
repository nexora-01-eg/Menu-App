import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { AmbientBackground } from "@/components/shared/ambient-background";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <div className="relative z-10">
        <DashboardTopbar />
        <div className="flex">
          <DashboardSidebar />
          <main className="min-w-0 flex-1 px-5 py-8 lg:px-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
