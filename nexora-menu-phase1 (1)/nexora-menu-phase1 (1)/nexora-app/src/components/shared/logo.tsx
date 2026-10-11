import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
}

export function Logo({ className, href = "/" }: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-gold-gradient shadow-glow-gold">
        <svg viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth={2.5} className="h-4 w-4">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      </span>
      <span className="text-[18px] font-bold tracking-tight">
        NEXORA
        <span className="ml-1 text-[10px] font-medium tracking-[2px] text-muted-foreground">
          MENU
        </span>
      </span>
    </Link>
  );
}
