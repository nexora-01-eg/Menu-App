import { redirect } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { getCurrentRestaurant } from "@/lib/tenant";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { MenuBuilderView } from "@/components/menu-builder/menu-builder-view";

export default async function MenuBuilderPage() {
  const ctx = await getCurrentRestaurant();
  if (!ctx) redirect("/login");

  const categories = await prisma.category.findMany({
    where: { restaurantId: ctx.restaurant.id },
    orderBy: { sortOrder: "asc" },
    include: {
      products: { orderBy: { sortOrder: "asc" } },
    },
  });

  // Prisma's Decimal type isn't serializable straight into a Client
  // Component — convert prices to plain numbers at the server/client
  // boundary.
  const plainCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    products: cat.products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
      imageUrl: p.imageUrl,
      isFeatured: p.isFeatured,
      isAvailable: p.isAvailable,
    })),
  }));

  return (
    <>
      <AppPageHeader
        title="Menu Builder"
        description="Drag to reorder, toggle availability, and manage pricing in real time."
      />
      <MenuBuilderView categories={plainCategories} />
    </>
  );
}
