import { Eye, ScanLine, TrendingUp, Repeat } from "lucide-react";
import { redirect } from "@/i18n/routing";
import { getCurrentRestaurant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { limitsFor } from "@/lib/limits";
import {
  getVisitorSummary,
  getScanSummary,
  getTopProducts,
  getTopCategories,
  getDeviceBreakdown,
  getOsBreakdown,
  getBrowserBreakdown,
  getTopCountries,
  getTopCities,
  getPeakHours,
  getDailyVisitors,
  getWeeklyGrowth,
} from "@/lib/analytics/queries";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { VisitorsAreaChart, PeakHoursChart, BreakdownDonut } from "@/components/analytics/dynamic-charts";
import { RankedList } from "@/components/analytics/ranked-list";
import { PhasePendingPanel } from "@/components/shared/phase-pending-panel";
import { Percent as PercentIcon } from "lucide-react";

export default async function AnalyticsPage() {
  const ctx = await getCurrentRestaurant();
  if (!ctx) redirect("/login");

  const subscription = await prisma.subscription.findUnique({ where: { restaurantId: ctx.restaurant.id } });
  const limits = limitsFor(subscription?.plan ?? "FREE");

  if (!limits.hasAnalytics) {
    return (
      <>
        <AppPageHeader title="Analytics" description="Deep visitor, device, and peak-hour reporting." />
        <PhasePendingPanel
          icon={PercentIcon}
          title="Analytics is a Starter+ feature"
          description="Upgrade your plan from the Subscription page to unlock visitor, device, and traffic analytics for this restaurant."
          phase="Upgrade required"
        />
      </>
    );
  }

  const restaurantId = ctx.restaurant.id;

  const [
    visitors,
    scans,
    topProducts,
    topCategories,
    devices,
    os,
    browsers,
    countries,
    cities,
    peakHours,
    dailyVisitors,
    weeklyGrowth,
  ] = await Promise.all([
    getVisitorSummary(restaurantId),
    getScanSummary(restaurantId),
    getTopProducts(restaurantId),
    getTopCategories(restaurantId),
    getDeviceBreakdown(restaurantId),
    getOsBreakdown(restaurantId),
    getBrowserBreakdown(restaurantId),
    getTopCountries(restaurantId),
    getTopCities(restaurantId),
    getPeakHours(restaurantId),
    getDailyVisitors(restaurantId, 7),
    getWeeklyGrowth(restaurantId),
  ]);

  const growthLabel = weeklyGrowth === null ? "—" : `${weeklyGrowth > 0 ? "+" : ""}${weeklyGrowth}%`;

  return (
    <>
      <AppPageHeader title="Analytics" description="Every number below comes straight from your menu's real traffic." />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Eye} label="Visitors Today" value={String(visitors.today)} delta={`Yesterday: ${visitors.yesterday}`} accent="blue" />
        <KpiCard icon={TrendingUp} label="Visitors (7 days)" value={String(visitors.last7Days)} delta={growthLabel} accent="gold" />
        <KpiCard icon={ScanLine} label="Total QR Scans" value={String(scans.total)} delta={`${scans.unique} unique`} accent="blue" />
        <KpiCard icon={Repeat} label="Repeat Scans" value={String(scans.repeat)} delta={`of ${scans.total}`} accent="gold" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Visitors — Last 7 Days</CardTitle>
                <CardDescription>Unique visitors per day</CardDescription>
              </div>
            </CardHeader>
            <VisitorsAreaChart data={dailyVisitors} />
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Peak Hours</CardTitle>
                <CardDescription>All-time views by hour of day</CardDescription>
              </div>
            </CardHeader>
            <PeakHoursChart data={peakHours} />
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="p-6">
              <CardHeader className="p-0 pb-3">
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <RankedList items={topProducts.map((p) => ({ id: p.id, label: p.name, count: p.count }))} />
            </Card>
            <Card className="p-6">
              <CardHeader className="p-0 pb-3">
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <RankedList items={topCategories.map((c) => ({ id: c.id, label: c.name, count: c.count }))} />
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-6">
            <CardHeader className="p-0 pb-2">
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <BreakdownDonut data={devices.map((d) => ({ label: d.label, count: d.count }))} />
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-2">
              <CardTitle>Operating System</CardTitle>
            </CardHeader>
            <BreakdownDonut data={os.map((d) => ({ label: d.label, count: d.count }))} />
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-3">
              <CardTitle>Browsers</CardTitle>
            </CardHeader>
            <RankedList items={browsers.map((b) => ({ label: b.label, count: b.count }))} />
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-3">
              <CardTitle>Top Countries</CardTitle>
            </CardHeader>
            <RankedList items={countries.map((c) => ({ label: c.label, count: c.count }))} />
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-3">
              <CardTitle>Top Cities</CardTitle>
            </CardHeader>
            <RankedList items={cities.map((c) => ({ label: c.label, count: c.count }))} />
          </Card>
        </div>
      </div>
    </>
  );
}
