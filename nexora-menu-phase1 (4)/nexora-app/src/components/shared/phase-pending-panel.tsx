import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PhasePendingPanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  phase: string;
}

export function PhasePendingPanel({ icon: Icon, title, description, phase }: PhasePendingPanelProps) {
  return (
    <Card className="flex flex-col items-center gap-4 px-8 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gold/[0.08]">
        <Icon className="h-6 w-6 text-gold" />
      </div>
      <div>
        <h3 className="font-display text-[19px] font-medium">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {phase}
      </span>
    </Card>
  );
}
