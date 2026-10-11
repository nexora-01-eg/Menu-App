"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { limitsFor } from "@/lib/limits";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

// ── Categories ──────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(60),
});

export async function createCategoryAction(input: { name: string }): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  try {
    const { restaurant } = await requireCurrentRestaurant();
    const count = await prisma.category.count({ where: { restaurantId: restaurant.id } });
    await prisma.category.create({
      data: { restaurantId: restaurant.id, name: parsed.data.name, sortOrder: count },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create category." };
  }

  revalidatePath("/menu-builder");
  return { ok: true };
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  try {
    const { restaurant } = await requireCurrentRestaurant();
    // Scope the delete by restaurantId too — not just id — so a
    // forged categoryId from another tenant can never match.
    await prisma.category.delete({
      where: { id: categoryId, restaurantId: restaurant.id },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete category." };
  }

  revalidatePath("/menu-builder");
  return { ok: true };
}

// ── Products ────────────────────────────────────────────────────

const productSchema = z.object({
  categoryId: z.string().min(1, "Choose a category."),
  name: z.string().trim().min(1, "Product name is required.").max(100),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  price: z.coerce.number().positive("Price must be greater than 0."),
  oldPrice: z.coerce.number().positive().optional().or(z.literal("")),
  isFeatured: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export async function createProductAction(input: ProductInput): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    const { restaurant } = await requireCurrentRestaurant();

    // Guard against a categoryId that belongs to a different tenant.
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, restaurantId: restaurant.id },
    });
    if (!category) return { ok: false, error: "Category not found." };

    const subscription = await prisma.subscription.findUnique({
      where: { restaurantId: restaurant.id },
    });
    const limits = limitsFor(subscription?.plan ?? "FREE");
    if (limits.maxProducts !== null) {
      const productCount = await prisma.product.count({ where: { restaurantId: restaurant.id } });
      if (productCount >= limits.maxProducts) {
        return {
          ok: false,
          error: `Your plan is limited to ${limits.maxProducts} products. Upgrade to add more.`,
        };
      }
    }

    const count = await prisma.product.count({ where: { categoryId: category.id } });

    await prisma.product.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: category.id,
        name: data.name,
        description: data.description || null,
        price: data.price,
        oldPrice: data.oldPrice || null,
        isFeatured: Boolean(data.isFeatured),
        sortOrder: count,
      },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create product." };
  }

  revalidatePath("/menu-builder");
  return { ok: true };
}

const updateProductSchema = productSchema.partial().extend({
  id: z.string().min(1),
});

export async function updateProductAction(
  input: z.infer<typeof updateProductSchema>,
): Promise<ActionResult> {
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const { id, ...rest } = parsed.data;

  try {
    const { restaurant } = await requireCurrentRestaurant();
    await prisma.product.update({
      where: { id, restaurantId: restaurant.id },
      data: {
        ...(rest.name !== undefined && { name: rest.name }),
        ...(rest.description !== undefined && { description: rest.description || null }),
        ...(rest.price !== undefined && { price: rest.price }),
        ...(rest.oldPrice !== undefined && { oldPrice: rest.oldPrice || null }),
        ...(rest.isFeatured !== undefined && { isFeatured: rest.isFeatured }),
        ...(rest.categoryId !== undefined && { categoryId: rest.categoryId }),
      },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update product." };
  }

  revalidatePath("/menu-builder");
  return { ok: true };
}

export async function toggleProductAvailabilityAction(
  productId: string,
  isAvailable: boolean,
): Promise<ActionResult> {
  try {
    const { restaurant } = await requireCurrentRestaurant();
    await prisma.product.update({
      where: { id: productId, restaurantId: restaurant.id },
      data: { isAvailable },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update product." };
  }

  revalidatePath("/menu-builder");
  return { ok: true };
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    const { restaurant } = await requireCurrentRestaurant();
    await prisma.product.delete({ where: { id: productId, restaurantId: restaurant.id } });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete product." };
  }

  revalidatePath("/menu-builder");
  return { ok: true };
}
