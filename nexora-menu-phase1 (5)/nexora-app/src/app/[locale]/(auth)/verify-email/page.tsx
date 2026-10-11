import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerifyEmailCard } from "@/components/shared/verify-email-card";

export const metadata: Metadata = { title: "Confirm your email" };

interface VerifyEmailPageProps {
  params: Promise<{ locale: string }>;
}

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { locale } = await params;
  const withLocale = (path: string) => (locale === "en" ? path : `/${locale}${path}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(withLocale("/login"));
  if (user.email_confirmed_at) redirect(withLocale("/dashboard"));

  return <VerifyEmailCard email={user.email ?? ""} />;
}
