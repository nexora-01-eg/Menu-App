"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Slice {
  label: string;
  count: number;
}

const COLORS = ["#C89B3C", "#3B82F6", "#F6D365", "#8B5CF6", "#10B981", "#EF4444"];

export function BreakdownDonut({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-[12px] text-muted-foreground">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          innerRadius={42}
          outerRadius={68}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            fontSize: 12,
          }}
        />
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          iconType="circle"
          iconSize={7}
          formatter={(value) => <span style={{ color: "#9099A8", fontSize: 11.5 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
