"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Point {
  date: string;
  count: number;
}

export function VisitorsAreaChart({ data }: { data: Point[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C89B3C" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#C89B3C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#9099A8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#9099A8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            fontSize: 12,
          }}
          labelStyle={{ color: "#E9E9EE" }}
        />
        <Area type="monotone" dataKey="count" stroke="#C89B3C" strokeWidth={2} fill="url(#visitorsGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
