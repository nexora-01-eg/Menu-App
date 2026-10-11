import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-14 flex flex-col",
        align === "center" ? "mx-auto max-w-xl items-center text-center" : "items-start",
        className,
      )}
    >
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/[0.08] px-3.5 py-[7px] text-[11px] font-bold uppercase tracking-[2px] text-gold">
        <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_theme(colors.gold.DEFAULT)]" />
        {eyebrow}
      </span>
      <h2 className="font-display text-[clamp(28px,3.4vw,40px)] font-medium leading-tight tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-3.5 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
