import { AnimatedCounter } from "@/components/shared/animated-counter";

const stats = [
  { target: 12400, compact: "12.4k+", label: "Restaurants Onboarded" },
  { target: 8200000, compact: "8.2M", label: "Menu Scans / Month" },
  { target: 63, compact: undefined, label: "Countries Served" },
  { target: 99, compact: undefined, suffix: "%", label: "Uptime SLA" },
];

export function StatsBar() {
  return (
    <section className="container pb-20">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-navy px-6 py-9 text-center">
            <div className="gold-text font-display text-[38px] font-medium">
              <AnimatedCounter target={stat.target} compactLabel={stat.compact} suffix={stat.suffix} />
            </div>
            <div className="mt-1.5 text-[12px] tracking-wide text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
