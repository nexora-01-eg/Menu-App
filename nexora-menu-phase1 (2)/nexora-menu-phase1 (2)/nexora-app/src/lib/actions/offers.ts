"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentRestaurant } from "@/lib/tenant";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const offerSchema = z
  .object({
    type: z.enum(["HAPPY_HOUR", "COUPON", "BANNER"]),
    title: z.string().trim().min(1, "Title is required.").max(80),
    description: z.string().trim().max(300).optional().or(z.literal("")),
    code: z.string().trim().max(30).optional().or(z.literal("")),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.coerce.number().positive("Discount must be greater than 0."),
    startDate: z.string().optional().or(z.literal("")),
    endDate: z.string().optional().or(z.literal("")),
    timeStart: z.string().optional().or(z.literal("")),
    timeEnd: z.string().optional().or(z.literal("")),
    branchId: z.string().optional().or(z.literal("")),
    productId: z.string().optional().or(z.literal("")),
    categoryId: z.string().optional().or(z.literal("")),
  })
  .refine((d) => d.discountType !== "PERCENTAGE" || d.discountValue <= 100, {
    message: "Percentage discount can't exceed 100%.",
    path: ["discountValue"],
  })
  .refine((d) => d.type !== "COUPON" || d.code, {
    message: "Coupon offers need a code.",
    path: ["code"],
  });

export type OfferInput = z.infer<typeof offerSchema>;

async function validateTargeting(restaurantId: string, input: OfferInput) {
  if (input.branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: input.branchId, restaurantId } });
    if (!branch) return "Selected branch not found.";
  }
  if (input.productId) {
    const product = await prisma.product.findFirst({ where: { id: input.productId, restaurantId } });
    if (!product) return "Selected product not found.";
  }
  if (input.categoryId) {
    const category = await prisma.category.findFirst({ where: { id: input.categoryId, restaurantId } });
    if (!category) return "Selected category not found.";
  }
  return null;
}

export async function createOfferAction(input: OfferInput): Promise<ActionResult> {
  const parsed = offerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    const { restaurant } = await requireCurrentRestaurant();
    const targetingError = await validateTargeting(restaurant.id, data);
    if (targetingError) return { ok: false, error: targetingError };

    await prisma.offer.create({
      data: {
        restaurantId: restaurant.id,
        type: data.type,
        title: data.title,
        description: data.description || null,
        code: data.code || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        timeStart: data.timeStart || null,
        timeEnd: data.timeEnd || null,
        branchId: data.branchId || null,
        productId: data.productId || null,
        categoryId: data.categoryId || null,
      },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create offer." };
  }

  revalidatePath("/offers");
  return { ok: true };
}

export async function updateOfferAction(
  input: { id: string } & OfferInput,
): Promise<ActionResult> {
  const { id, ...rest } = input;
  const parsed = offerSchema.safeParse(rest);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    const { restaurant } = await requireCurrentRestaurant();
    const targetingError = await validateTargeting(restaurant.id, data);
    if (targetingError) return { ok: false, error: targetingError };

    await prisma.offer.update({
      where: { id, restaurantId: restaurant.id },
      data: {
        type: data.type,
        title: data.title,
        description: data.description || null,
        code: data.code || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        timeStart: data.timeStart || null,
        timeEnd: data.timeEnd || null,
        branchId: data.branchId || null,
        productId: data.productId || null,
        categoryId: data.categoryId || null,
      },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update offer." };
  }

  revalidatePath("/offers");
  return { ok: true };
}

export async function setOfferStatusAction(
  id: string,
  status: "ACTIVE" | "PAUSED" | "ARCHIVED",
): Promise<ActionResult> {
  try {
    const { restaurant } = await requireCurrentRestaurant();
    await prisma.offer.update({ where: { id, restaurantId: restaurant.id }, data: { status } });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update offer." };
  }
  revalidatePath("/offers");
  return { ok: true };
}

export async function deleteOfferAction(id: string): Promise<ActionResult> {
  try {
    const { restaurant } = await requireCurrentRestaurant();
    await prisma.offer.delete({ where: { id, restaurantId: restaurant.id } });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete offer." };
  }
  revalidatePath("/offers");
  return { ok: true };
}
