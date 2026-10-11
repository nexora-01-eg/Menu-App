import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerMenuView } from "@/components/customer/customer-menu-view";
import { getOpenStatusLabel } from "@/lib/hours";
import { resolveOfferForProduct, computeDiscountedPrice, formatOfferBadge, type OfferLike } from "@/lib/offers-engine";

// Cache the rendered menu for 60s (stale-while-revalidate) instead of
// hitting Postgres on every single guest scan — this is by far the
// highest-traffic route in the app. Trade-off: a menu edit or a
// Happy-Hour window starting/ending can take up to ~60s to reflect
// publicly. Client-side analytics tracking is unaffected since it
// fires on every page view regardless of caching.
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await prisma.restaurant.findUnique({ where: { slug }, select: { name: true } });
  return {
    title: restaurant ? `${restaurant.name} — Menu` : "Menu",
    description: restaurant ? `View the live menu for ${restaurant.name}, powered by NEXORA.` : undefined,
  };
}

export default async function CustomerMenuPage({ params }: PageProps) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: { products: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } } },
      },
      branches: { where: { isPrimary: true }, take: 1 },
    },
  });

  if (!restaurant || !restaurant.isPublished) notFound();

  const primaryBranch = restaurant.branches[0];

  const offers = await prisma.offer.findMany({
    where: { restaurantId: restaurant.id, status: "ACTIVE" },
  });
  const offerLikes: OfferLike[] = offers.map((o) => ({
    id: o.id,
    type: o.type,
    title: o.title,
    discountType: o.discountType,
    discountValue: Number(o.discountValue),
    startDate: o.startDate,
    endDate: o.endDate,
    timeStart: o.timeStart,
    timeEnd: o.timeEnd,
    branchId: o.branchId,
    productId: o.productId,
    categoryId: o.categoryId,
    status: o.status,
  }));

  return (
    <CustomerMenuView
      restaurantSlug={restaurant.slug}
      restaurantName={restaurant.name}
      tagline={restaurant.description ?? primaryBranch?.address ?? ""}
      logoUrl={restaurant.logoUrl}
      openStatusLabel={getOpenStatusLabel(restaurant.workingHours)}
      whatsapp={restaurant.whatsapp ?? primaryBranch?.whatsapp ?? ""}
      orderingEnabled={restaurant.orderingEnabled}
      whatsappOrderTemplate={restaurant.whatsappOrderTemplate}
      categories={restaurant.categories.map((c) => ({ id: c.id, name: c.name }))}
      products={restaurant.categories.flatMap((c) =>
        c.products.map((p) => {
          const price = Number(p.price);
          const offer = resolveOfferForProduct(offerLikes, { id: p.id, categoryId: c.id }, primaryBranch?.id ?? null);
          return {
            id: p.id,
            categoryId: c.id,
            name: p.name,
            description: p.description ?? "",
            price,
            oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
            imageUrl: p.imageUrl,
            offerBadge: offer ? formatOfferBadge(offer) : null,
            offerPrice: offer ? computeDiscountedPrice(price, offer) : null,
          };
        }),
      )}
    />
  );
}
