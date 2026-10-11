import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
  accent?: "gold" | "blue";
}

export function KpiCard({ icon: Icon, label, value, delta, accent = "blue" }: KpiCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-[10px] border",
            accent === "gold" ? "border-gold/30 bg-gold/[0.12]" : "border-electric/25 bg-electric/[0.12]",
          )}
        >
          <Icon className={cn("h-[17px] w-[17px]", accent === "gold" ? "text-gold" : "text-electric")} />
        </div>
        <span className="rounded-full bg-emerald-400/10 px-2 py-[3px] text-[11px] font-bold text-emerald-400">
          {delta}
        </span>
      </div>
      <div className="mt-4 font-display text-[30px]">{value}</div>
      <div className="mt-0.5 text-[12.5px] text-muted-foreground">{label}</div>
    </Card>
  );
}
