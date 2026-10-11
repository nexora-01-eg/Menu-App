import { redirect } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { getCurrentRestaurant } from "@/lib/tenant";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { QrCustomizer } from "@/components/qr-studio/qr-customizer";

export default async function QrStudioPage() {
  const ctx = await getCurrentRestaurant();
  if (!ctx) redirect("/login");

  const [restaurant, branches] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: ctx.restaurant.id } }),
    prisma.branch.findMany({
      where: { restaurantId: ctx.restaurant.id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!restaurant) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-[1100px]">
      <AppPageHeader
        title="QR Studio"
        description="A real, scannable QR code that opens your live menu — design it, then export it."
      />
      <QrCustomizer
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
        logoUrl={restaurant.logoUrl}
        branches={branches}
      />
    </div>
  );
}
