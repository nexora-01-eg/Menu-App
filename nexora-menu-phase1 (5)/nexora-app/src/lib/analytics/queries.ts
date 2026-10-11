import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/** Distinct visitors who fired a VIEW event in [since, until). */
export async function countUniqueVisitors(restaurantId: string, since: Date, until: Date = new Date()) {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
    select count(distinct meta->>'visitorId') as count
    from analytics_events
    where "restaurantId" = ${restaurantId}
      and type = 'VIEW'
      and "createdAt" >= ${since}
      and "createdAt" < ${until}
      and meta->>'visitorId' is not null
  `);
  return Number(rows[0]?.count ?? 0);
}

export async function countEvents(
  restaurantId: string,
  type: string,
  since?: Date,
  until: Date = new Date(),
) {
  return prisma.analyticsEvent.count({
    where: {
      restaurantId,
      type: type as never,
      ...(since && { createdAt: { gte: since, lt: until } }),
    },
  });
}

export interface VisitorSummary {
  today: number;
  yesterday: number;
  last7Days: number;
  last30Days: number;
}

export async function getVisitorSummary(restaurantId: string): Promise<VisitorSummary> {
  const [today, yesterday, last7Days, last30Days] = await Promise.all([
    countUniqueVisitors(restaurantId, daysAgo(0)),
    countUniqueVisitors(restaurantId, daysAgo(1), daysAgo(0)),
    countUniqueVisitors(restaurantId, daysAgo(7)),
    countUniqueVisitors(restaurantId, daysAgo(30)),
  ]);
  return { today, yesterday, last7Days, last30Days };
}

export interface ScanSummary {
  total: number;
  unique: number;
  repeat: number;
}

export async function getScanSummary(restaurantId: string): Promise<ScanSummary> {
  const total = await countEvents(restaurantId, "SCAN");
  const uniqueRows = await prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
    select count(distinct meta->>'visitorId') as count
    from analytics_events
    where "restaurantId" = ${restaurantId} and type = 'SCAN' and meta->>'visitorId' is not null
  `);
  const unique = Number(uniqueRows[0]?.count ?? 0);
  return { total, unique, repeat: Math.max(0, total - unique) };
}

export interface RankedItem {
  id: string;
  name: string;
  count: number;
}

export async function getTopProducts(restaurantId: string, limit = 5): Promise<RankedItem[]> {
  const rows = await prisma.$queryRaw<{ id: string; count: bigint }[]>(Prisma.sql`
    select meta->>'productId' as id, count(*) as count
    from analytics_events
    where "restaurantId" = ${restaurantId} and type = 'PRODUCT_CLICK' and meta->>'productId' is not null
    group by meta->>'productId'
    order by count desc
    limit ${limit}
  `);
  if (rows.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: rows.map((r) => r.id) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  return rows
    .filter((r) => nameById.has(r.id))
    .map((r) => ({ id: r.id, name: nameById.get(r.id)!, count: Number(r.count) }));
}

export async function getTopCategories(restaurantId: string, limit = 5): Promise<RankedItem[]> {
  const rows = await prisma.$queryRaw<{ id: string; count: bigint }[]>(Prisma.sql`
    select meta->>'categoryId' as id, count(*) as count
    from analytics_events
    where "restaurantId" = ${restaurantId} and type = 'CATEGORY_VIEW' and meta->>'categoryId' is not null
    group by meta->>'categoryId'
    order by count desc
    limit ${limit}
  `);
  if (rows.length === 0) return [];

  const categories = await prisma.category.findMany({
    where: { id: { in: rows.map((r) => r.id) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  return rows
    .filter((r) => nameById.has(r.id))
    .map((r) => ({ id: r.id, name: nameById.get(r.id)!, count: Number(r.count) }));
}

export interface LabeledCount {
  label: string;
  count: number;
}

async function groupByMetaField(
  restaurantId: string,
  field: "device" | "os" | "browser" | "country" | "city",
  limit = 8,
): Promise<LabeledCount[]> {
  const rows = await prisma.$queryRaw<{ label: string | null; count: bigint }[]>(Prisma.sql`
    select meta->>${field} as label, count(*) as count
    from analytics_events
    where "restaurantId" = ${restaurantId} and type = 'VIEW' and meta->>${field} is not null
    group by meta->>${field}
    order by count desc
    limit ${limit}
  `);
  return rows.filter((r) => r.label).map((r) => ({ label: r.label as string, count: Number(r.count) }));
}

export const getDeviceBreakdown = (restaurantId: string) => groupByMetaField(restaurantId, "device");
export const getOsBreakdown = (restaurantId: string) => groupByMetaField(restaurantId, "os");
export const getBrowserBreakdown = (restaurantId: string) => groupByMetaField(restaurantId, "browser");
export const getTopCountries = (restaurantId: string) => groupByMetaField(restaurantId, "country");
export const getTopCities = (restaurantId: string) => groupByMetaField(restaurantId, "city");

/** Views per hour-of-day (0-23), summed across all history — powers the "Peak Hours" chart. */
export async function getPeakHours(restaurantId: string): Promise<{ hour: number; count: number }[]> {
  const rows = await prisma.$queryRaw<{ hour: number; count: bigint }[]>(Prisma.sql`
    select (meta->>'hour')::int as hour, count(*) as count
    from analytics_events
    where "restaurantId" = ${restaurantId} and type = 'VIEW' and meta->>'hour' is not null
    group by (meta->>'hour')::int
    order by hour asc
  `);
  const byHour = new Map(rows.map((r) => [r.hour, Number(r.count)]));
  return Array.from({ length: 24 }, (_, hour) => ({ hour, count: byHour.get(hour) ?? 0 }));
}

/** Unique-visitor count per day for the last N days — powers the visitors trend chart. */
export async function getDailyVisitors(
  restaurantId: string,
  days = 7,
): Promise<{ date: string; count: number }[]> {
  const rows = await prisma.$queryRaw<{ date: string; count: bigint }[]>(Prisma.sql`
    select to_char("createdAt", 'YYYY-MM-DD') as date, count(distinct meta->>'visitorId') as count
    from analytics_events
    where "restaurantId" = ${restaurantId}
      and type = 'VIEW'
      and "createdAt" >= ${daysAgo(days - 1)}
      and meta->>'visitorId' is not null
    group by to_char("createdAt", 'YYYY-MM-DD')
  `);
  const byDate = new Map(rows.map((r) => [r.date, Number(r.count)]));

  return Array.from({ length: days }, (_, i) => {
    const d = daysAgo(days - 1 - i);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: byDate.get(key) ?? 0 };
  });
}

/** % change in unique visitors this week vs. the previous 7-day window. */
export async function getWeeklyGrowth(restaurantId: string): Promise<number | null> {
  const [thisWeek, lastWeek] = await Promise.all([
    countUniqueVisitors(restaurantId, daysAgo(7)),
    countUniqueVisitors(restaurantId, daysAgo(14), daysAgo(7)),
  ]);
  if (lastWeek === 0) return thisWeek > 0 ? 100 : null;
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
}

export interface ActivityEntry {
  type: string;
  createdAt: Date;
  label: string; // human-readable, e.g. "Product X clicked"
}

/** Most recent real events, resolved against Product/Category names — powers the Dashboard's "Recent Activity" feed. */
export async function getRecentActivity(restaurantId: string, limit = 6): Promise<ActivityEntry[]> {
  const events = await prisma.analyticsEvent.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  if (events.length === 0) return [];

  const productIds = events
    .map((e) => (e.meta as Record<string, unknown> | null)?.productId)
    .filter((v): v is string => typeof v === "string");
  const categoryIds = events
    .map((e) => (e.meta as Record<string, unknown> | null)?.categoryId)
    .filter((v): v is string => typeof v === "string");

  const [products, categories] = await Promise.all([
    productIds.length
      ? prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } })
      : [],
    categoryIds.length
      ? prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } })
      : [],
  ]);
  const productName = new Map(products.map((p) => [p.id, p.name]));
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  return events.map((e) => {
    const meta = (e.meta as Record<string, unknown> | null) ?? {};
    const pid = typeof meta.productId === "string" ? meta.productId : undefined;
    const cid = typeof meta.categoryId === "string" ? meta.categoryId : undefined;

    let label = "Menu viewed";
    switch (e.type) {
      case "VIEW":
        label = "Menu opened by a guest";
        break;
      case "SCAN":
        label = "QR code scanned";
        break;
      case "PRODUCT_CLICK":
        label = pid && productName.has(pid) ? `"${productName.get(pid)}" viewed` : "A product was viewed";
        break;
      case "CATEGORY_VIEW":
        label = cid && categoryName.has(cid) ? `"${categoryName.get(cid)}" category opened` : "A category was opened";
        break;
      case "SEARCH":
        label = "A guest searched the menu";
        break;
      case "WHATSAPP_CLICK":
        label = "Guest tapped Order on WhatsApp";
        break;
      case "CALL_CLICK":
        label = "Guest tapped Call";
        break;
      case "SHARE":
        label = "Guest shared the menu";
        break;
    }

    return { type: e.type, createdAt: e.createdAt, label };
  });
}
