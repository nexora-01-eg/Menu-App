import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  // English stays un-prefixed at "/", Arabic lives under "/ar" — the
  // common pattern so existing English links/bookmarks keep working.
  localePrefix: "as-needed",
});

export const RTL_LOCALES = ["ar"];

export function getDirection(locale: string): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

// Locale-aware Link / useRouter / usePathname / redirect — use these
// instead of the plain next/navigation ones everywhere in the app so
// navigation always keeps (or drops) the /ar prefix correctly.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
