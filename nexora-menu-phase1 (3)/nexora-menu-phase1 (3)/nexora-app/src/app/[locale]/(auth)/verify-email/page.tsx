import type { Metadata } from "next";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { VerifyEmailCard } from "@/components/shared/verify-email-card";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function VerifyEmailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.email_confirmed_at) redirect("/dashboard");

  return <VerifyEmailCard email={user.email ?? ""} />;
}
