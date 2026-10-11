import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isOfferCurrentlyActive } from "@/lib/offers-engine";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  restaurantSlug: z.string().min(1),
  code: z.string().trim().min(1).max(30),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // Coupon codes are guessable — cap attempts hard per IP, separate
  // from the general /api/track burst guard.
  if (!checkRateLimit(`coupon:${ip}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: parsed.data.restaurantSlug },
    select: { id: true },
  });
  if (!restaurant) {
    return NextResponse.json({ ok: false, error: "Menu not found." }, { status: 404 });
  }

  const offer = await prisma.offer.findFirst({
    where: {
      restaurantId: restaurant.id,
      type: "COUPON",
      status: "ACTIVE",
      code: { equals: parsed.data.code, mode: "insensitive" },
    },
  });

  if (
    !offer ||
    !isOfferCurrentlyActive({
      id: offer.id,
      type: offer.type,
      title: offer.title,
      discountType: offer.discountType,
      discountValue: Number(offer.discountValue),
      startDate: offer.startDate,
      endDate: offer.endDate,
      timeStart: offer.timeStart,
      timeEnd: offer.timeEnd,
      branchId: offer.branchId,
      productId: offer.productId,
      categoryId: offer.categoryId,
      status: offer.status,
    })
  ) {
    return NextResponse.json({ ok: false, error: "This code isn't valid right now." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    offer: {
      id: offer.id,
      title: offer.title,
      discountType: offer.discountType,
      discountValue: Number(offer.discountValue),
      productId: offer.productId,
      categoryId: offer.categoryId,
    },
  });
}
