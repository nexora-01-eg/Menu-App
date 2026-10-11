export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="w-full animate-pulse rounded-lg bg-white/[0.04]"
      style={{ height }}
      aria-hidden
    />
  );
}

export function DonutSkeleton() {
  return (
    <div className="flex h-[180px] items-center justify-center">
      <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-white/[0.04]" aria-hidden />
    </div>
  );
}
