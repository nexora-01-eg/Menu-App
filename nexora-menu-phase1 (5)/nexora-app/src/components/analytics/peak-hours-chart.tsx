"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Point {
  hour: number;
  count: number;
}

export function PeakHoursChart({ data }: { data: Point[] }) {
  const formatted = data.map((d) => ({ ...d, label: `${d.hour}:00` }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={formatted} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: "#9099A8", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          interval={2}
        />
        <YAxis tick={{ fill: "#9099A8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            fontSize: 12,
          }}
          labelStyle={{ color: "#E9E9EE" }}
          cursor={{ fill: "rgba(200,155,60,0.08)" }}
        />
        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 2, 2]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
