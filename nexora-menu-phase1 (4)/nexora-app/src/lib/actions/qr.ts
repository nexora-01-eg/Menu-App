"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { limitsFor } from "@/lib/limits";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

const qrStyleSchema = z.object({
  branchId: z.string().nullable(),
  label: z.string().trim().min(1).max(60),
  fgColor: z.string().min(1).max(20),
  cornerStyle: z.enum(["rounded", "square"]),
  hasLogo: z.boolean(),
  errorCorrectionLevel: z.enum(["L", "M", "Q", "H"]),
});

export type QrStyleInput = z.infer<typeof qrStyleSchema>;

export async function saveQrCodeAction(input: QrStyleInput): Promise<ActionResult> {
  const parsed = qrStyleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    const { restaurant } = await requireCurrentRestaurant();

    const subscription = await prisma.subscription.findUnique({ where: { restaurantId: restaurant.id } });
    const limits = limitsFor(subscription?.plan ?? "FREE");
    const existingCount = await prisma.qrCode.count({ where: { restaurantId: restaurant.id } });

    if (limits.maxQrCodes !== null && existingCount >= limits.maxQrCodes) {
      return {
        ok: false,
        error: `Your plan is limited to ${limits.maxQrCodes} saved QR code${limits.maxQrCodes > 1 ? "s" : ""}. Upgrade to save more.`,
      };
    }

    if (data.branchId) {
      const branch = await prisma.branch.findFirst({
        where: { id: data.branchId, restaurantId: restaurant.id },
      });
      if (!branch) return { ok: false, error: "Branch not found." };
    }

    const record = await prisma.qrCode.create({
      data: {
        restaurantId: restaurant.id,
        branchId: data.branchId,
        label: data.label,
        style: {
          fgColor: data.fgColor,
          cornerStyle: data.cornerStyle,
          hasLogo: data.hasLogo,
          errorCorrectionLevel: data.errorCorrectionLevel,
        },
      },
    });

    revalidatePath("/qr-studio");
    return { ok: true, id: record.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save QR code." };
  }
}

export async function deleteQrCodeAction(id: string): Promise<ActionResult> {
  try {
    const { restaurant } = await requireCurrentRestaurant();
    await prisma.qrCode.delete({ where: { id, restaurantId: restaurant.id } });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete QR code." };
  }
  revalidatePath("/qr-studio");
  return { ok: true };
}
