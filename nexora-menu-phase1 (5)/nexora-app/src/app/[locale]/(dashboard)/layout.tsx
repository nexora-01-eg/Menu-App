import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { AmbientBackground } from "@/components/shared/ambient-background";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params;
  // Build every redirect target manually instead of going through
  // next-intl's redirect() here — that helper produced a broken
  // "/undefinedundefined" Location header when called from this
  // layout in the installed next-intl version. A plain, explicit
  // locale prefix is simple and never wrong.
  const withLocale = (path: string) => (locale === "en" ? path : `/${locale}${path}`);

  // middleware.ts already guarantees a signed-in user reaches this far;
  // here we additionally guarantee they have a restaurant workspace —
  // first-time users get bounced to onboarding before seeing any
  // tenant-scoped page.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(withLocale("/login"));
  if (!user.email_confirmed_at) redirect(withLocale("/verify-email"));

  const membership = await prisma.restaurantMember.findFirst({
    where: { userId: user.id },
    include: { restaurant: true },
  });

  if (!membership) redirect(withLocale("/onboarding"));

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
