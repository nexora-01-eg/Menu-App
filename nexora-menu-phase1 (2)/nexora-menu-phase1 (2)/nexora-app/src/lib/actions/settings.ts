"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentRestaurant } from "@/lib/tenant";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const settingsSchema = z.object({
  currency: z.string().trim().min(1).max(10),
  language: z.enum(["en", "ar"]),
  themeMode: z.enum(["dark", "light", "auto"]),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  serviceFeePercent: z.coerce.number().min(0).max(100).optional(),
  orderingEnabled: z.boolean(),
  whatsappOrderTemplate: z.string().trim().max(500).optional().or(z.literal("")),
});

export type RestaurantSettingsInput = z.infer<typeof settingsSchema>;

export async function updateRestaurantSettingsAction(
  input: RestaurantSettingsInput,
): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    const { restaurant } = await requireCurrentRestaurant();
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        currency: data.currency,
        language: data.language,
        themeMode: data.themeMode,
        taxRate: data.taxRate ?? null,
        serviceFeePercent: data.serviceFeePercent ?? null,
        orderingEnabled: data.orderingEnabled,
        whatsappOrderTemplate: data.whatsappOrderTemplate || null,
      },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save settings." };
  }

  revalidatePath("/settings");
  return { ok: true };
}
