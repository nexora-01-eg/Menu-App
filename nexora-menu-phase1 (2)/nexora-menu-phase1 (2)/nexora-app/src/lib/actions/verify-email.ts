"use server";

import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function resendVerificationEmailAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { ok: false, error: "You need to be signed in." };

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
    options: { emailRedirectTo: `${siteConfig.url}/auth/callback?next=/dashboard` },
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
