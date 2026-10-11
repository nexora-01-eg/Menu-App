import { cn } from "@/lib/utils";

interface QrGlyphProps {
  size?: number; // grid dimension, e.g. 7 or 9
  moduleClassName?: string;
  finderClassName?: string;
  className?: string;
}

/**
 * Renders a QR-code-*looking* module grid for decorative use in the
 * hero, QR Studio preview, and customer-view mockups. Styled to match
 * NEXORA's real QR brand reference: circular data modules and rounded
 * finder squares with an inner dot, rather than plain solid blocks.
 * Not a real, scannable QR — Phase 2's QR Generator wires the
 * `qrcode` package for actual generation once a restaurant slug
 * exists to encode.
 */
export function QrGlyph({ size = 7, moduleClassName, finderClassName, className }: QrGlyphProps) {
  const cells = Array.from({ length: size * size }, (_, i) => {
    const r = Math.floor(i / size);
    const c = i % size;
    const isFinder = (r < 2 && c < 2) || (r < 2 && c > size - 3) || (r > size - 3 && c < 2);
    const on = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1 > 0.42;
    return { isFinder, on, key: i };
  });

  return (
    <div
      className={cn("grid gap-[5px]", className)}
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gridTemplateRows: `repeat(${size}, 1fr)` }}
    >
      {cells.map(({ isFinder, on, key }) =>
        isFinder ? (
          <div
            key={key}
            className={cn(
              "flex items-center justify-center rounded-[6px] border-[2.5px] border-gold bg-transparent",
              finderClassName,
            )}
          >
            <span className="h-[35%] w-[35%] rounded-full bg-gold" />
          </div>
        ) : (
          <div
            key={key}
            className={cn(
              "rounded-full transition-colors",
              on ? cn("bg-foreground/90", moduleClassName) : "bg-transparent",
            )}
          />
        ),
      )}
    </div>
  );
}
