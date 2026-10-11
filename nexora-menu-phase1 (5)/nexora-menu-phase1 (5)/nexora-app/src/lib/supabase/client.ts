import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for the browser (Client Components, event handlers).
 * Safe to call repeatedly — @supabase/ssr manages the underlying
 * session/cookie sync under the hood.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
