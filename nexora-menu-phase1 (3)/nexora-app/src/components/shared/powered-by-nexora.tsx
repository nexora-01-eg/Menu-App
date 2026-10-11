import Image from "next/image";

interface PoweredByNexoraProps {
  /** "row" for footers/sidebars, "stack" for tighter vertical spots. */
  variant?: "row" | "stack";
  className?: string;
}

/**
 * NEXORA Menu is a product built and operated under NEXORA (the parent
 * "Business Growth Platform" company) — this is NOT the parent
 * company's own site. This badge is the one place that credits the
 * parent brand explicitly, using their real logo asset, so the two
 * identities stay visually distinct: gold "NEXORA MENU" wordmark for
 * the product (everywhere else), this muted badge for the operator.
 */
export function PoweredByNexora({ variant = "row", className }: PoweredByNexoraProps) {
  return (
    <div
      className={`flex items-center gap-2 opacity-70 transition-opacity hover:opacity-100 ${
        variant === "stack" ? "flex-col text-center" : "flex-row"
      } ${className ?? ""}`}
    >
      <span className="text-[10px] uppercase tracking-[1.5px] text-muted-foreground">
        Powered by
      </span>
      <Image
        src="/brand/nexora-parent-logo.png"
        alt="NEXORA — Business Growth Platform"
        width={72}
        height={128}
        className="h-6 w-auto object-contain"
      />
    </div>
  );
}
