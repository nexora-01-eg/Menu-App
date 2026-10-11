"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentRestaurant } from "@/lib/tenant";
import {
  productImagePath,
  uploadProductImage,
  deleteProductImageByUrl,
} from "@/lib/supabase/storage";

export interface UploadResult {
  ok: boolean;
  imageUrl?: string;
  error?: string;
}

export async function uploadProductImageAction(formData: FormData): Promise<UploadResult> {
  const productId = formData.get("productId");
  const file = formData.get("file");

  if (typeof productId !== "string" || !(file instanceof Blob)) {
    return { ok: false, error: "Missing file or product." };
  }

  const { restaurant } = await requireCurrentRestaurant();

  // Tenant check: the product must belong to the caller's restaurant.
  const product = await prisma.product.findFirst({
    where: { id: productId, restaurantId: restaurant.id },
  });
  if (!product) return { ok: false, error: "Product not found." };

  const supabase = await createClient();

  // Replacing an image: clean up the old file so Storage doesn't
  // silently accumulate orphaned uploads.
  if (product.imageUrl) {
    await deleteProductImageByUrl(supabase, product.imageUrl);
  }

  const path = productImagePath(restaurant.id, productId);
  const result = await uploadProductImage(supabase, path, file);
  if ("error" in result) return { ok: false, error: result.error };

  await prisma.product.update({
    where: { id: productId, restaurantId: restaurant.id },
    data: { imageUrl: result.publicUrl },
  });

  revalidatePath("/menu-builder");
  return { ok: true, imageUrl: result.publicUrl };
}

export async function deleteProductImageAction(productId: string): Promise<UploadResult> {
  const { restaurant } = await requireCurrentRestaurant();

  const product = await prisma.product.findFirst({
    where: { id: productId, restaurantId: restaurant.id },
  });
  if (!product) return { ok: false, error: "Product not found." };

  if (product.imageUrl) {
    const supabase = await createClient();
    await deleteProductImageByUrl(supabase, product.imageUrl);
  }

  await prisma.product.update({
    where: { id: productId, restaurantId: restaurant.id },
    data: { imageUrl: null },
  });

  revalidatePath("/menu-builder");
  return { ok: true };
}
