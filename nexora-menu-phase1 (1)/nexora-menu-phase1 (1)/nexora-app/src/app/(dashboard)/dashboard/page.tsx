import { Eye, Users, TrendingUp, ScanLine, ClipboardList, Star, Timer, UserPlus } from "lucide-react";
import { AppPageHeader } from "@/components/shared/app-page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { WeeklyBarChart } from "@/components/dashboard/weekly-bar-chart";
import { PopularItems } from "@/components/dashboard/popular-items";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Placeholder fixtures — Phase 2 replaces these with Prisma queries
// scoped to the signed-in user's active restaurant.
const weeklyViews = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 62 },
  { day: "Wed", value: 38 },
  { day: "Thu", value: 80 },
  { day: "Fri", value: 70 },
  { day: "Sat", value: 95 },
  { day: "Sun", value: 58 },
];

const popularItems = [
  { rank: "01", name: "Truffle Risotto", thumb: "from-[#6b4a2f] to-[#3a2717]", percent: 92, count: 920 },
  { rank: "02", name: "Burrata & Fig", thumb: "from-emerald-600 to-emerald-950", percent: 74, count: 740 },
  { rank: "03", name: "Tuna Tartare", thumb: "from-electric to-blue-900", percent: 61, count: 610 },
  { rank: "04", name: "Charred Octopus", thumb: "from-violet-600 to-violet-950", percent: 48, count: 480 },
];

const activity = [
  { icon: ScanLine, text: <><b>QR scanned</b> at Branch — Downtown</>, time: "2 minutes ago" },
  { icon: ClipboardList, text: <><b>Truffle Risotto</b> marked as Featured</>, time: "18 minutes ago" },
  { icon: Timer, text: <><b>Happy Hour</b> offer went live</>, time: "1 hour ago" },
  { icon: UserPlus, text: <>New visitor from <b>Instagram</b></>, time: "2 hours ago" },
];

export default function DashboardPage() {
  return (
    <>
      <AppPageHeader
        title="Good evening, Lumière Bistro"
        description="Here's how your menu performed today."
        action={<Button variant="gold">+ Add Product</Button>}
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Eye} label="Total Views" value="48,290" delta="+12.4%" accent="blue" />
        <KpiCard icon={Users} label="Today's Visitors" value="642" delta="+4.1%" accent="gold" />
        <KpiCard icon={TrendingUp} label="Weekly Visitors" value="3,910" delta="+8.7%" accent="blue" />
        <KpiCard icon={ScanLine} label="QR Scans" value="1,204" delta="+21.3%" accent="gold" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-4">
          <WeeklyBarChart data={weeklyViews} />
          <ActivityFeed entries={activity} />
        </div>
        <div className="flex flex-col gap-4">
          <PopularItems items={popularItems} />
          <Card className="p-6">
            <CardHeader className="p-0 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Revenue (Est.)</CardTitle>
                <CardDescription>This month</CardDescription>
              </div>
            </CardHeader>
            <div className="gold-text font-display text-[30px]">$18,420</div>
            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Star className="h-3 w-3 text-gold" />
              Based on featured-item order tags
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
