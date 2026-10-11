import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Auth runs first: if the session logic decides to redirect (no
  // user on a protected route), honor that redirect immediately.
  // Otherwise hand off to next-intl for locale detection/rewriting.
  const authResponse = await updateSession(request);
  const isRedirect = authResponse.status >= 300 && authResponse.status < 400;
  if (isRedirect) return authResponse;

  return intlMiddleware(request);
}

export const config = {
  // Run on every route except static assets and API routes — the
  // Stripe webhook and any future API handlers stay locale-free.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
