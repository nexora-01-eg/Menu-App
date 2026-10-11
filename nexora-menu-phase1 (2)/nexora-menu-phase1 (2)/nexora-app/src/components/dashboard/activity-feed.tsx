import { type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ActivityEntry {
  icon: LucideIcon;
  text: React.ReactNode;
  time: string;
}

interface ActivityFeedProps {
  entries: ActivityEntry[];
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Live</CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-col">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-start gap-3 border-b border-white/[0.08] py-2.5 last:border-none">
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-electric/30 bg-electric/[0.12]">
              <entry.icon className="h-3 w-3 text-electric" />
            </div>
            <div>
              <p className="text-[12.5px] leading-snug">{entry.text}</p>
              <span className="text-[11px] text-muted-foreground">{entry.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
