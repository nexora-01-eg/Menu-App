import type { Metadata } from "next";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/shared/logo";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { OnboardingWizard } from "@/components/shared/onboarding-wizard";

export const metadata: Metadata = { title: "Set up your restaurant" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/verify-email");

  const membership = await prisma.restaurantMember.findFirst({ where: { userId: user.id } });
  if (membership) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <AmbientBackground />
      <div className="relative z-10 mb-8">
        <Logo />
      </div>
      <div className="relative z-10 w-full">
        <OnboardingWizard />
      </div>
    </div>
  );
}
