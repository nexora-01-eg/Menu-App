import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Every Supabase auth email (signup confirmation, password reset,
 * magic link) should point here via `emailRedirectTo` / the Supabase
 * dashboard's Site URL + Redirect URLs config. This exchanges the
 * one-time `code` for a real session cookie, then sends the user
 * where they were headed.
 *
 * Without this route, clicking a confirmation link lands the user
 * back on the marketing site with the auth code sitting unused in
 * the URL — they'd look "confirmed" in Supabase but never actually
 * get signed in on our side.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
