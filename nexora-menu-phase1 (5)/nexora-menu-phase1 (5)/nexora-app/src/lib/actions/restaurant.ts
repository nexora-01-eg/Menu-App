"use server";

import { z } from "zod";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const onboardingSchema = z.object({
  restaurantName: z.string().trim().min(2).max(80),
  businessType: z.string().trim().min(1),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  currency: z.string().trim().min(1).max(10),
  language: z.string().trim().min(1).max(10),
  timezone: z.string().trim().min(1).max(60),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export interface CreateRestaurantResult {
  ok: boolean;
  error?: string;
  slug?: string;
}

/**
 * Generates a unique restaurant slug by appending -2, -3, … if the
 * base slug is already taken. Keeps collisions invisible to the user
 * instead of surfacing a raw uniqueness error from Postgres.
 */
async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "restaurant";
  let candidate = root;
  let n = 2;
  // Bounded loop — a restaurant name colliding 50+ times is not a
  // real-world case, and this guards against an infinite loop bug.
  while (n < 50) {
    const existing = await prisma.restaurant.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    candidate = `${root}-${n}`;
    n += 1;
  }
  return `${root}-${Date.now()}`;
}

export async function createRestaurantAction(
  input: OnboardingInput,
): Promise<CreateRestaurantResult> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to create a restaurant." };
  }

  // A user who already owns/staffs a restaurant shouldn't create a
  // second one from this flow — send them straight to the dashboard.
  const alreadyMember = await prisma.restaurantMember.findFirst({
    where: { userId: user.id },
  });
  if (alreadyMember) {
    return { ok: false, error: "You already have a restaurant workspace." };
  }

  const slug = await uniqueSlug(data.restaurantName);

  try {
    await prisma.$transaction(async (tx) => {
      // Mirror the Supabase auth user into our own User table the
      // first time we see them (idempotent via upsert).
      await tx.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email ?? "",
          name: (user.user_metadata?.name as string | undefined) ?? null,
        },
      });

      const restaurant = await tx.restaurant.create({
        data: {
          slug,
          name: data.restaurantName,
          businessType: data.businessType,
          country: data.country || null,
          currency: data.currency,
          language: data.language,
          timezone: data.timezone,
          phone: data.phone || null,
          whatsapp: data.whatsapp || null,
          themeMode: "dark",
          isPublished: false,
        },
      });

      await tx.restaurantMember.create({
        data: { userId: user.id, restaurantId: restaurant.id, role: "OWNER" },
      });

      await tx.branch.create({
        data: {
          restaurantId: restaurant.id,
          name: "Main Branch",
          address: data.address || null,
          phone: data.phone || null,
          whatsapp: data.whatsapp || null,
          isPrimary: true,
        },
      });

      await tx.subscription.create({
        data: { restaurantId: restaurant.id, plan: "FREE", status: "ACTIVE" },
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { ok: false, error: message };
  }

  // Server Actions run outside the normal render tree, so the locale
  // has to be read explicitly. Using next/navigation's plain redirect
  // with a manually-built path here — next-intl's own redirect()
  // produced a broken "/undefinedundefined" Location header when
  // called from a Server Action in this installed next-intl version.
  const locale = await getLocale();
  redirect(locale === "en" ? "/dashboard" : `/${locale}/dashboard`);
}
