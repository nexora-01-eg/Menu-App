import {
  Eye, Users, TrendingUp, ScanLine, ClipboardList, Timer, MousePointerClick,
  Search as SearchIcon, Share2, Phone, CheckCircle2, Layers, UtensilsCrossed, MapPin,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getCurrentRestaurant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import { getVisitorSummary, getScanSummary, getTopProducts, getDailyVisitors, getRecentActivity } from "@/lib/analytics/queries";
import { getMenuCompletion } from "@/lib/menu-completion";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { WeeklyBarChart } from "@/components/dashboard/weekly-bar-chart";
import { PopularItems } from "@/components/dashboard/popular-items";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ACTIVITY_ICONS: Record<string, typeof ScanLine> = {
  VIEW: Eye,
  SCAN: ScanLine,
  PRODUCT_CLICK: ClipboardList,
  CATEGORY_VIEW: Layers,
  SEARCH: SearchIcon,
  WHATSAPP_CLICK: MousePointerClick,
  CALL_CLICK: Phone,
  SHARE: Share2,
};

const THUMBS = [
  "from-[#6b4a2f] to-[#3a2717]",
  "from-emerald-600 to-emerald-950",
  "from-electric to-blue-900",
  "from-violet-600 to-violet-950",
  "from-gold-light to-gold",
];
function thumbFor(id: string) {
  const hash = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return THUMBS[hash % THUMBS.length];
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const withLocale = (path: string) => (locale === "en" ? path : `/${locale}${path}`);

  const ctx = await getCurrentRestaurant();
  if (!ctx) redirect(withLocale("/login"));

  const restaurantId = ctx.restaurant.id;

  const [
    visitors,
    scans,
    topProducts,
    dailyVisitors,
    activity,
    completion,
    subscription,
    branchCount,
    productCount,
    categoryCount,
  ] = await Promise.all([
    getVisitorSummary(restaurantId),
    getScanSummary(restaurantId),
    getTopProducts(restaurantId, 4),
    getDailyVisitors(restaurantId, 7),
    getRecentActivity(restaurantId, 5),
    getMenuCompletion(restaurantId),
    prisma.subscription.findUnique({ where: { restaurantId } }),
    prisma.branch.count({ where: { restaurantId } }),
    prisma.product.count({ where: { restaurantId } }),
    prisma.category.count({ where: { restaurantId } }),
  ]);

  const maxDaily = Math.max(...dailyVisitors.map((d) => d.count), 1);
  const weeklyChartData = dailyVisitors.map((d) => ({
    day: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
    value: Math.max(4, Math.round((d.count / maxDaily) * 100)),
  }));

  const maxProductClicks = Math.max(...topProducts.map((p) => p.count), 1);
  const popularItemsData = topProducts.map((p, i) => ({
    rank: String(i + 1).padStart(2, "0"),
    name: p.name,
    thumb: thumbFor(p.id),
    percent: Math.round((p.count / maxProductClicks) * 100),
    count: p.count,
  }));

  const activityData = activity.map((a) => ({
    icon: ACTIVITY_ICONS[a.type] ?? Eye,
    text: <>{a.label}</>,
    time: timeAgo(a.createdAt),
  }));

  return (
    <>
      <AppPageHeader
        title={`Good to see you, ${ctx.restaurant.name}`}
        description="Here's how your menu is actually performing — every number here is real."
        action={
          <Button variant="gold" asChild>
            <Link href="/menu-builder">+ Add Product</Link>
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Eye} label="Today's Visitors" value={String(visitors.today)} delta={`Yesterday: ${visitors.yesterday}`} accent="blue" />
        <KpiCard icon={Users} label="Visitors (7 days)" value={String(visitors.last7Days)} delta={`${visitors.last30Days} in 30 days`} accent="gold" />
        <KpiCard icon={TrendingUp} label="QR Scans" value={String(scans.total)} delta={`${scans.unique} unique`} accent="blue" />
        <KpiCard icon={ScanLine} label="Repeat Visitors" value={String(scans.repeat)} delta="via QR" accent="gold" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-4">
          <WeeklyBarChart data={weeklyChartData} />
          <ActivityFeed entries={activityData.length ? activityData : [{ icon: Timer, text: <>No activity yet — share your menu link to start seeing real traffic here.</>, time: "" }]} />
        </div>
        <div className="flex flex-col gap-4">
          <PopularItems items={popularItemsData.length ? popularItemsData : [{ rank: "—", name: "No product views yet", thumb: THUMBS[0], percent: 0, count: 0 }]} />

          <Card className="p-6">
            <CardHeader className="p-0 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Menu Completion</CardTitle>
                <CardDescription>{completion.percent}%</CardDescription>
              </div>
            </CardHeader>
            <Progress value={completion.percent} className="mb-3" />
            {completion.missing.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {completion.missing.slice(0, 3).map((m) => (
                  <li key={m} className="text-[11.5px] text-muted-foreground">· {m}</li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-1.5 text-[11.5px] text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Your menu profile is complete
              </p>
            )}
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-3">
              <CardTitle>Workspace</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="font-display text-[20px]">{categoryCount}</div>
                <div className="mt-0.5 flex items-center justify-center gap-1 text-[10.5px] text-muted-foreground">
                  <Layers className="h-3 w-3" /> Categories
                </div>
              </div>
              <div>
                <div className="font-display text-[20px]">{productCount}</div>
                <div className="mt-0.5 flex items-center justify-center gap-1 text-[10.5px] text-muted-foreground">
                  <UtensilsCrossed className="h-3 w-3" /> Products
                </div>
              </div>
              <div>
                <div className="font-display text-[20px]">{branchCount}</div>
                <div className="mt-0.5 flex items-center justify-center gap-1 text-[10.5px] text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Branches
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3 text-[12px]">
              <span className="text-muted-foreground">Current plan</span>
              <span className="font-semibold capitalize">{(subscription?.plan ?? "free").toLowerCase()}</span>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
