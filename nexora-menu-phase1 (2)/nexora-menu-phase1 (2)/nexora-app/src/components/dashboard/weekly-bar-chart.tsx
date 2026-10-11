"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DayPoint {
  day: string;
  value: number; // 0-100
}

interface WeeklyBarChartProps {
  data: DayPoint[];
}

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Views</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </div>
      </CardHeader>
      <div className="flex h-40 items-end gap-2.5">
        {data.map((point) => (
          <div key={point.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div
              className="w-full rounded-t-md rounded-b-[2px] bg-gold-gradient opacity-85 transition-opacity hover:opacity-100 hover:shadow-glow-gold"
              style={{ height: `${point.value}%` }}
            />
            <span className="text-[10px] text-muted-foreground">{point.day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
