import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentRestaurant } from "@/lib/tenant";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { OfferManager, type OfferRow } from "@/components/offers/offer-manager";

export default async function OffersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const withLocale = (path: string) => (locale === "en" ? path : `/${locale}${path}`);

  const ctx = await getCurrentRestaurant();
  if (!ctx) redirect(withLocale("/login"));

  const restaurantId = ctx.restaurant.id;

  const [offers, branches, categories, products] = await Promise.all([
    prisma.offer.findMany({ where: { restaurantId }, orderBy: { createdAt: "desc" } }),
    prisma.branch.findMany({ where: { restaurantId }, select: { id: true, name: true } }),
    prisma.category.findMany({ where: { restaurantId }, select: { id: true, name: true } }),
    prisma.product.findMany({ where: { restaurantId }, select: { id: true, name: true } }),
  ]);

  const offerRows: OfferRow[] = offers.map((o) => ({
    id: o.id,
    type: o.type,
    title: o.title,
    description: o.description ?? "",
    code: o.code ?? "",
    discountType: o.discountType,
    discountValue: Number(o.discountValue),
    startDate: o.startDate ? o.startDate.toISOString().slice(0, 10) : "",
    endDate: o.endDate ? o.endDate.toISOString().slice(0, 10) : "",
    timeStart: o.timeStart ?? "",
    timeEnd: o.timeEnd ?? "",
    branchId: o.branchId ?? "",
    productId: o.productId ?? "",
    categoryId: o.categoryId ?? "",
    status: o.status,
  }));

  return (
    <>
      <AppPageHeader title="Offers" description="Happy hour windows, coupons, and promo banners." />
      <OfferManager offers={offerRows} targeting={{ branches, categories, products }} />
    </>
  );
}
