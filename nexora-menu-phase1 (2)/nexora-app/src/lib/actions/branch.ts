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

const branchSchema = z.object({
  name: z.string().trim().min(1, "Branch name is required.").max(80),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
});

export type BranchInput = z.infer<typeof branchSchema>;

export async function createBranchAction(input: BranchInput): Promise<ActionResult> {
  const parsed = branchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    const { restaurant } = await requireCurrentRestaurant();

    const subscription = await prisma.subscription.findUnique({
      where: { restaurantId: restaurant.id },
    });
    const limits = limitsFor(subscription?.plan ?? "FREE");
    const branchCount = await prisma.branch.count({ where: { restaurantId: restaurant.id } });

    if (limits.maxBranches !== null && branchCount >= limits.maxBranches) {
      return {
        ok: false,
        error: `Your plan is limited to ${limits.maxBranches} branch${limits.maxBranches > 1 ? "es" : ""}. Upgrade to add more.`,
      };
    }

    await prisma.branch.create({
      data: {
        restaurantId: restaurant.id,
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        isPrimary: branchCount === 0,
      },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create branch." };
  }

  revalidatePath("/restaurant-profile");
  return { ok: true };
}

const updateBranchSchema = branchSchema.partial().extend({ id: z.string().min(1) });

export async function updateBranchAction(
  input: z.infer<typeof updateBranchSchema>,
): Promise<ActionResult> {
  const parsed = updateBranchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const { id, ...rest } = parsed.data;

  try {
    const { restaurant } = await requireCurrentRestaurant();
    await prisma.branch.update({
      where: { id, restaurantId: restaurant.id },
      data: {
        ...(rest.name !== undefined && { name: rest.name }),
        ...(rest.address !== undefined && { address: rest.address || null }),
        ...(rest.phone !== undefined && { phone: rest.phone || null }),
        ...(rest.whatsapp !== undefined && { whatsapp: rest.whatsapp || null }),
      },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update branch." };
  }

  revalidatePath("/restaurant-profile");
  return { ok: true };
}

export async function deleteBranchAction(branchId: string): Promise<ActionResult> {
  try {
    const { restaurant } = await requireCurrentRestaurant();

    const branch = await prisma.branch.findFirst({
      where: { id: branchId, restaurantId: restaurant.id },
    });
    if (!branch) return { ok: false, error: "Branch not found." };

    const totalBranches = await prisma.branch.count({ where: { restaurantId: restaurant.id } });
    if (totalBranches <= 1) {
      return { ok: false, error: "A restaurant needs at least one branch." };
    }

    await prisma.branch.delete({ where: { id: branchId, restaurantId: restaurant.id } });

    // If we just deleted the primary branch, promote whichever one's left.
    if (branch.isPrimary) {
      const next = await prisma.branch.findFirst({ where: { restaurantId: restaurant.id } });
      if (next) {
        await prisma.branch.update({ where: { id: next.id, restaurantId: restaurant.id }, data: { isPrimary: true } });
      }
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete branch." };
  }

  revalidatePath("/restaurant-profile");
  return { ok: true };
}

export async function setPrimaryBranchAction(branchId: string): Promise<ActionResult> {
  try {
    const { restaurant } = await requireCurrentRestaurant();
    await prisma.$transaction([
      prisma.branch.updateMany({
        where: { restaurantId: restaurant.id },
        data: { isPrimary: false },
      }),
      prisma.branch.update({
        where: { id: branchId, restaurantId: restaurant.id },
        data: { isPrimary: true },
      }),
    ]);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update branch." };
  }

  revalidatePath("/restaurant-profile");
  return { ok: true };
}
