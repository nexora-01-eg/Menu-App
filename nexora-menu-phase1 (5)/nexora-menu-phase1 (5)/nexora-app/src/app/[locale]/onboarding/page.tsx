import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/shared/logo";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { OnboardingWizard } from "@/components/shared/onboarding-wizard";

export const metadata: Metadata = { title: "Set up your restaurant" };

interface OnboardingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale } = await params;
  const withLocale = (path: string) => (locale === "en" ? path : `/${locale}${path}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(withLocale("/login"));
  if (!user.email_confirmed_at) redirect(withLocale("/verify-email"));

  const membership = await prisma.restaurantMember.findFirst({ where: { userId: user.id } });
  if (membership) redirect(withLocale("/dashboard"));

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
