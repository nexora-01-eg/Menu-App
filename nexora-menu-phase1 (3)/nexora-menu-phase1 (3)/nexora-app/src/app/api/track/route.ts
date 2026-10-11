import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recordAnalyticsEvent } from "@/lib/analytics/track";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const trackSchema = z.object({
  restaurantSlug: z.string().min(1),
  type: z.enum([
    "VIEW",
    "SCAN",
    "PRODUCT_CLICK",
    "WHATSAPP_CLICK",
    "CALL_CLICK",
    "SHARE",
    "CATEGORY_VIEW",
    "SEARCH",
  ]),
  visitorId: z.string().min(1).max(80).optional(),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  query: z.string().max(120).optional(),
});

// Simple in-memory burst guard per server instance — not a substitute
// for a real rate limiter (e.g. Upstash) in a multi-region deployment,
// but stops a single misbehaving client from hammering the DB. See
// the Launch Report's "Known limitations" section.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const data = parsed.data;

  const ip = getClientIp(req);
  // Hard ceiling per IP regardless of visitor/type — stops a script
  // from just rotating visitorId to bypass the per-event dedupe below.
  if (!checkRateLimit(`track-ip:${ip}`, 120, 60_000)) {
    return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: data.restaurantSlug },
    select: { id: true },
  });
  if (!restaurant) {
    return NextResponse.json({ error: "Unknown restaurant" }, { status: 404 });
  }

  // Burst guard: same visitor + same event type + same target, within 2s.
  const dedupeKey = `track-event:${restaurant.id}:${data.visitorId ?? "anon"}:${data.type}:${data.productId ?? ""}`;
  if (!checkRateLimit(dedupeKey, 1, 2_000)) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const country = req.headers.get("x-vercel-ip-country");
  const city = req.headers.get("x-vercel-ip-city");
  const language = req.headers.get("accept-language")?.split(",")[0] ?? null;

  await recordAnalyticsEvent({
    restaurantId: restaurant.id,
    type: data.type,
    visitorId: data.visitorId,
    productId: data.productId,
    categoryId: data.categoryId,
    query: data.query,
    userAgent: req.headers.get("user-agent"),
    country: country ? decodeURIComponent(country) : null,
    city: city ? decodeURIComponent(city) : null,
    language,
  });

  return NextResponse.json({ ok: true });
}
