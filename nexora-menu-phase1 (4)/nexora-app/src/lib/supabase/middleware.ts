import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const PROTECTED_SEGMENTS = [
  "dashboard",
  "menu-builder",
  "qr-studio",
  "restaurant-profile",
  "offers",
  "analytics",
  "settings",
  "subscription",
  "onboarding",
  "verify-email",
];

/** Strips a leading "/ar" or "/en" locale segment, if present. */
function stripLocale(pathname: string) {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if ((routing.locales as readonly string[]).includes(maybeLocale ?? "")) {
    return "/" + rest.join("/");
  }
  return pathname;
}

/**
 * Refreshes the Supabase auth session on every request that passes
 * through middleware.ts, and redirects unauthenticated users away
 * from protected (dashboard) routes — locale-prefix aware, so
 * `/ar/dashboard` is protected exactly like `/dashboard`.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathWithoutLocale = stripLocale(request.nextUrl.pathname);
  const isProtected = PROTECTED_SEGMENTS.some((seg) => pathWithoutLocale.startsWith(`/${seg}`));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    // Preserve whichever locale prefix (or lack thereof) the user was
    // already on when we bounce them to /login.
    const localeSegment = request.nextUrl.pathname.split("/")[1];
    const hasLocalePrefix = (routing.locales as readonly string[]).includes(localeSegment ?? "");
    url.pathname = hasLocalePrefix ? `/${localeSegment}/login` : "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
