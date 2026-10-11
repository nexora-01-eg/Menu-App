import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { AmbientBackground } from "@/components/shared/ambient-background";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // middleware.ts already guarantees a signed-in user reaches this far;
  // here we additionally guarantee they have a restaurant workspace —
  // first-time users get bounced to onboarding before seeing any
  // tenant-scoped page.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/verify-email");

  const membership = await prisma.restaurantMember.findFirst({
    where: { userId: user.id },
    include: { restaurant: true },
  });

  if (!membership) redirect("/onboarding");

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <div className="relative z-10">
        <DashboardTopbar restaurantName={membership.restaurant.name} />
        <div className="flex">
          <DashboardSidebar />
          <main className="min-w-0 flex-1 px-5 py-8 lg:px-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
