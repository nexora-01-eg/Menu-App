import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentRestaurant } from "@/lib/tenant";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { RestaurantAssetUploader } from "@/components/restaurant-profile/restaurant-asset-uploader";
import { RestaurantProfileForm } from "@/components/restaurant-profile/restaurant-profile-form";
import { BranchManager } from "@/components/restaurant-profile/branch-manager";
import { PublishToggleCard } from "@/components/restaurant-profile/publish-toggle-card";
import { DEFAULT_HOURS, type WorkingHours } from "@/components/restaurant-profile/working-hours-editor";

export default async function RestaurantProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const withLocale = (path: string) => (locale === "en" ? path : `/${locale}${path}`);

  const ctx = await getCurrentRestaurant();
  if (!ctx) redirect(withLocale("/login"));

  const [restaurant, branches] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: ctx.restaurant.id } }),
    prisma.branch.findMany({
      where: { restaurantId: ctx.restaurant.id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  if (!restaurant) redirect(withLocale("/onboarding"));

  const primaryBranch = branches.find((b) => b.isPrimary) ?? branches[0];

  return (
    <>
      <AppPageHeader
        title="Restaurant Profile"
        description="Branding, contact details, hours, and branches guests see on your public menu."
      />

      <PublishToggleCard slug={restaurant.slug} isPublished={restaurant.isPublished} />

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end">
        <RestaurantAssetUploader kind="cover" imageUrl={restaurant.coverUrl} className="sm:flex-1" />
        <RestaurantAssetUploader kind="logo" imageUrl={restaurant.logoUrl} className="shrink-0" />
      </div>

      <div className="mb-5">
        <RestaurantProfileForm
          initial={{
            name: restaurant.name,
            description: restaurant.description ?? "",
            address: primaryBranch?.address ?? "",
            phone: restaurant.phone ?? "",
            whatsapp: restaurant.whatsapp ?? "",
            website: restaurant.website ?? "",
            facebook: restaurant.facebook ?? "",
            instagram: restaurant.instagram ?? "",
            tiktok: restaurant.tiktok ?? "",
            workingHours: (restaurant.workingHours as WorkingHours | null) ?? DEFAULT_HOURS,
          }}
        />
      </div>

      <BranchManager
        branches={branches.map((b) => ({
          id: b.id,
          name: b.name,
          address: b.address ?? "",
          phone: b.phone ?? "",
          whatsapp: b.whatsapp ?? "",
          isPrimary: b.isPrimary,
        }))}
      />
    </>
  );
}
