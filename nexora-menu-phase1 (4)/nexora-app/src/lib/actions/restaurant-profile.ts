"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentRestaurant } from "@/lib/tenant";
import {
  restaurantLogoPath,
  restaurantCoverPath,
  uploadRestaurantAsset,
  deleteRestaurantAssetByUrl,
} from "@/lib/supabase/storage";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const dayHoursSchema = z.object({
  closed: z.boolean(),
  open: z.string().optional(),
  close: z.string().optional(),
});

const workingHoursSchema = z.object({
  mon: dayHoursSchema,
  tue: dayHoursSchema,
  wed: dayHoursSchema,
  thu: dayHoursSchema,
  fri: dayHoursSchema,
  sat: dayHoursSchema,
  sun: dayHoursSchema,
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  facebook: z.string().trim().max(200).optional().or(z.literal("")),
  instagram: z.string().trim().max(200).optional().or(z.literal("")),
  tiktok: z.string().trim().max(200).optional().or(z.literal("")),
  workingHours: workingHoursSchema,
});

export type RestaurantProfileInput = z.infer<typeof profileSchema>;

export async function togglePublishAction(isPublished: boolean): Promise<ActionResult> {
  try {
    const { restaurant } = await requireCurrentRestaurant();
    await prisma.restaurant.update({ where: { id: restaurant.id }, data: { isPublished } });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update." };
  }
  revalidatePath("/restaurant-profile");
  return { ok: true };
}

export async function updateRestaurantProfileAction(
  input: RestaurantProfileInput,
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    const { restaurant } = await requireCurrentRestaurant();
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        name: data.name,
        description: data.description || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        facebook: data.facebook || null,
        instagram: data.instagram || null,
        tiktok: data.tiktok || null,
        workingHours: data.workingHours,
      },
    });

    // Address lives on the primary Branch, not the Restaurant row —
    // keep the two in sync so the profile page's "Address" field
    // actually means something.
    if (data.address !== undefined) {
      const primaryBranch = await prisma.branch.findFirst({
        where: { restaurantId: restaurant.id, isPrimary: true },
      });
      if (primaryBranch) {
        await prisma.branch.update({
          where: { id: primaryBranch.id, restaurantId: restaurant.id },
          data: { address: data.address || null },
        });
      }
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save profile." };
  }

  revalidatePath("/restaurant-profile");
  return { ok: true };
}

// ── Logo / cover upload ────────────────────────────────────────────

export interface UploadResult extends ActionResult {
  imageUrl?: string;
}

export async function uploadRestaurantLogoAction(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof Blob)) return { ok: false, error: "No file provided." };

  const { restaurant } = await requireCurrentRestaurant();
  const supabase = await createClient();

  const current = await prisma.restaurant.findUnique({ where: { id: restaurant.id } });
  if (current?.logoUrl) await deleteRestaurantAssetByUrl(supabase, current.logoUrl);

  const path = restaurantLogoPath(restaurant.id);
  const result = await uploadRestaurantAsset(supabase, path, file);
  if ("error" in result) return { ok: false, error: result.error };

  await prisma.restaurant.update({ where: { id: restaurant.id }, data: { logoUrl: result.publicUrl } });
  revalidatePath("/restaurant-profile");
  return { ok: true, imageUrl: result.publicUrl };
}

export async function deleteRestaurantLogoAction(): Promise<ActionResult> {
  const { restaurant } = await requireCurrentRestaurant();
  const current = await prisma.restaurant.findUnique({ where: { id: restaurant.id } });
  if (current?.logoUrl) {
    const supabase = await createClient();
    await deleteRestaurantAssetByUrl(supabase, current.logoUrl);
  }
  await prisma.restaurant.update({ where: { id: restaurant.id }, data: { logoUrl: null } });
  revalidatePath("/restaurant-profile");
  return { ok: true };
}

export async function uploadRestaurantCoverAction(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof Blob)) return { ok: false, error: "No file provided." };

  const { restaurant } = await requireCurrentRestaurant();
  const supabase = await createClient();

  const current = await prisma.restaurant.findUnique({ where: { id: restaurant.id } });
  if (current?.coverUrl) await deleteRestaurantAssetByUrl(supabase, current.coverUrl);

  const path = restaurantCoverPath(restaurant.id);
  const result = await uploadRestaurantAsset(supabase, path, file);
  if ("error" in result) return { ok: false, error: result.error };

  await prisma.restaurant.update({ where: { id: restaurant.id }, data: { coverUrl: result.publicUrl } });
  revalidatePath("/restaurant-profile");
  return { ok: true, imageUrl: result.publicUrl };
}

export async function deleteRestaurantCoverAction(): Promise<ActionResult> {
  const { restaurant } = await requireCurrentRestaurant();
  const current = await prisma.restaurant.findUnique({ where: { id: restaurant.id } });
  if (current?.coverUrl) {
    const supabase = await createClient();
    await deleteRestaurantAssetByUrl(supabase, current.coverUrl);
  }
  await prisma.restaurant.update({ where: { id: restaurant.id }, data: { coverUrl: null } });
  revalidatePath("/restaurant-profile");
  return { ok: true };
}
