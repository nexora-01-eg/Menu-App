"use client";

import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  UserCircle,
  QrCode,
  UtensilsCrossed,
  Percent,
  BarChart3,
  Settings,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { dashboardNav } from "@/config/site";
import { cn } from "@/lib/utils";
import { PoweredByNexora } from "@/components/shared/powered-by-nexora";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  UserCircle,
  QrCode,
  UtensilsCrossed,
  Percent,
  BarChart3,
  Settings,
  CreditCard,
};

export function DashboardSidebar() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-[230px] shrink-0 flex-col gap-1 overflow-y-auto border-e border-white/[0.08] p-4 lg:flex">
      {dashboardNav.map((group) => (
        <div key={group.sectionKey} className="mb-1">
          <p className="mb-2 mt-4 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-[#5c6577] first:mt-0">
            {t(`dashboardNav.${group.sectionKey}`)}
          </p>
          {group.items.map((item) => {
            const Icon = iconMap[item.icon];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-lg px-3.5 py-[11px] text-[13.5px] font-semibold transition-colors",
                  active
                    ? "border border-gold/25 bg-gradient-to-r from-gold/[0.15] to-transparent text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                )}
              >
                {Icon && <Icon className="h-[17px] w-[17px] shrink-0" />}
                {t(`dashboardNav.${item.labelKey}`)}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="mt-auto border-t border-white/[0.08] px-3 pt-4">
        <PoweredByNexora variant="stack" className="items-center" />
      </div>
    </aside>
  );
}
