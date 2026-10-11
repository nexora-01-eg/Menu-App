import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        gold: "border-gold/35 bg-gold/10 text-gold",
        blue: "border-electric/30 bg-electric/10 text-electric",
        success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
        neutral: "border-white/10 bg-white/[0.04] text-muted-foreground",
        solid: "border-transparent bg-gold-gradient text-void",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
