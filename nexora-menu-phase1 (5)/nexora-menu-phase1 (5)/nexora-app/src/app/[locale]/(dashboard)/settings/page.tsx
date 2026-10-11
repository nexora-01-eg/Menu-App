import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentRestaurant } from "@/lib/tenant";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const withLocale = (path: string) => (locale === "en" ? path : `/${locale}${path}`);

  const ctx = await getCurrentRestaurant();
  if (!ctx) redirect(withLocale("/login"));

  const restaurant = await prisma.restaurant.findUnique({ where: { id: ctx.restaurant.id } });
  if (!restaurant) redirect(withLocale("/onboarding"));

  return (
    <>
      <AppPageHeader title="Settings" description="Regional settings, theme, taxes, and ordering." />
      <SettingsForm
        initial={{
          currency: restaurant.currency,
          language: (restaurant.language as "en" | "ar") ?? "en",
          themeMode: (restaurant.themeMode as "dark" | "light" | "auto") ?? "dark",
          taxRate: restaurant.taxRate ? Number(restaurant.taxRate) : undefined,
          serviceFeePercent: restaurant.serviceFeePercent ? Number(restaurant.serviceFeePercent) : undefined,
          orderingEnabled: restaurant.orderingEnabled,
          whatsappOrderTemplate: restaurant.whatsappOrderTemplate ?? "",
        }}
      />
    </>
  );
}
