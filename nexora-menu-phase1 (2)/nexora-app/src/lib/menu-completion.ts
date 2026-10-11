import { prisma } from "@/lib/prisma";

export interface CompletionResult {
  percent: number;
  missing: string[];
}

/** A weighted checklist of "does this restaurant actually look ready to show guests" — every check is a real DB read, nothing fabricated. */
export async function getMenuCompletion(restaurantId: string): Promise<CompletionResult> {
  const [restaurant, categoryCount, productCount, productsWithImage, branchCount] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
    prisma.category.count({ where: { restaurantId } }),
    prisma.product.count({ where: { restaurantId } }),
    prisma.product.count({ where: { restaurantId, imageUrl: { not: null } } }),
    prisma.branch.count({ where: { restaurantId } }),
  ]);

  const checks: { label: string; done: boolean }[] = [
    { label: "Add a logo", done: Boolean(restaurant?.logoUrl) },
    { label: "Add a cover image", done: Boolean(restaurant?.coverUrl) },
    { label: "Write a description", done: Boolean(restaurant?.description) },
    { label: "Add at least one category", done: categoryCount > 0 },
    { label: "Add at least 3 products", done: productCount >= 3 },
    { label: "Add product photos", done: productCount > 0 && productsWithImage / Math.max(productCount, 1) >= 0.5 },
    { label: "Add contact details", done: Boolean(restaurant?.phone || restaurant?.whatsapp) },
    { label: "Confirm at least one branch", done: branchCount > 0 },
    { label: "Publish your menu", done: Boolean(restaurant?.isPublished) },
  ];

  const done = checks.filter((c) => c.done).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter((c) => !c.done).map((c) => c.label),
  };
}
