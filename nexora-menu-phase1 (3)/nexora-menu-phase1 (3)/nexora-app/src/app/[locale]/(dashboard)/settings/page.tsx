import { redirect } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { getCurrentRestaurant } from "@/lib/tenant";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const ctx = await getCurrentRestaurant();
  if (!ctx) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({ where: { id: ctx.restaurant.id } });
  if (!restaurant) redirect("/onboarding");

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
