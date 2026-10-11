import { prisma } from "@/lib/prisma";
import type { AnalyticsEventType } from "@prisma/client";

export interface TrackEventInput {
  restaurantId: string;
  type: AnalyticsEventType;
  visitorId?: string;
  productId?: string;
  categoryId?: string;
  query?: string;
  userAgent?: string | null;
  country?: string | null;
  city?: string | null;
  language?: string | null;
}

/** Minimal, dependency-free UA parsing — good enough for device/browser/OS breakdowns without pulling in a 200KB library. */
function parseUserAgent(ua: string | null | undefined) {
  const s = ua ?? "";

  let device: "mobile" | "tablet" | "desktop" = "desktop";
  if (/iPad|Tablet/i.test(s)) device = "tablet";
  else if (/Mobi|Android|iPhone/i.test(s)) device = "mobile";

  let os = "Other";
  if (/Windows/i.test(s)) os = "Windows";
  else if (/Mac OS X/i.test(s) && !/iPhone|iPad/i.test(s)) os = "macOS";
  else if (/Android/i.test(s)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(s)) os = "iOS";
  else if (/Linux/i.test(s)) os = "Linux";

  let browser = "Other";
  if (/Edg\//i.test(s)) browser = "Edge";
  else if (/Chrome\//i.test(s) && !/Edg\//i.test(s)) browser = "Chrome";
  else if (/Safari\//i.test(s) && !/Chrome\//i.test(s)) browser = "Safari";
  else if (/Firefox\//i.test(s)) browser = "Firefox";

  return { device, os, browser };
}

export async function recordAnalyticsEvent(input: TrackEventInput) {
  const { device, os, browser } = parseUserAgent(input.userAgent);
  const now = new Date();

  await prisma.analyticsEvent.create({
    data: {
      restaurantId: input.restaurantId,
      type: input.type,
      meta: {
        visitorId: input.visitorId ?? null,
        productId: input.productId ?? null,
        categoryId: input.categoryId ?? null,
        query: input.query ?? null,
        device,
        os,
        browser,
        country: input.country ?? null,
        city: input.city ?? null,
        language: input.language ?? null,
        hour: now.getUTCHours(),
      },
    },
  });
}
