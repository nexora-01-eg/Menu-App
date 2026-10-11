"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const locales = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/[0.04] p-0.5",
        className,
      )}
    >
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => router.replace(pathname, { locale: l.code })}
          className={cn(
            "rounded-[6px] px-2.5 py-1 text-[11px] font-bold transition-colors",
            locale === l.code
              ? "bg-gold-gradient text-void"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-current={locale === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
