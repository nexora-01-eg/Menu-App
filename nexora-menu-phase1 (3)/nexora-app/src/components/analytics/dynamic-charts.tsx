"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton, DonutSkeleton } from "@/components/analytics/chart-skeleton";

export const VisitorsAreaChart = dynamic(
  () => import("@/components/analytics/visitors-area-chart").then((m) => m.VisitorsAreaChart),
  { ssr: false, loading: () => <ChartSkeleton height={220} /> },
);

export const PeakHoursChart = dynamic(
  () => import("@/components/analytics/peak-hours-chart").then((m) => m.PeakHoursChart),
  { ssr: false, loading: () => <ChartSkeleton height={180} /> },
);

export const BreakdownDonut = dynamic(
  () => import("@/components/analytics/breakdown-donut").then((m) => m.BreakdownDonut),
  { ssr: false, loading: () => <DonutSkeleton /> },
);
