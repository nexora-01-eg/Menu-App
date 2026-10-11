import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Resolves the signed-in user's active restaurant (first membership
 * for now — Phase 6's multi-restaurant switcher will let a user pick
 * among several). Every dashboard Server Component and Server Action
 * should call this instead of querying Prisma directly with a raw
 * restaurantId, so tenant scoping can never accidentally be skipped.
 *
 * Returns null if there's no signed-in user or no restaurant yet —
 * callers decide whether that means redirect(), notFound(), or an
 * error result.
 */
export async function getCurrentRestaurant() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const membership = await prisma.restaurantMember.findFirst({
    where: { userId: user.id },
    include: { restaurant: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) return null;

  return {
    userId: user.id,
    role: membership.role,
    restaurant: membership.restaurant,
  };
}

/** Throws if there's no authenticated tenant — for actions that must never run without one. */
export async function requireCurrentRestaurant() {
  const ctx = await getCurrentRestaurant();
  if (!ctx) throw new Error("No authenticated restaurant workspace.");
  return ctx;
}
