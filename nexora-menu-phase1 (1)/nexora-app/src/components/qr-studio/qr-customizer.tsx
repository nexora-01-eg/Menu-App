"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrGlyph } from "@/components/shared/qr-glyph";
import { cn } from "@/lib/utils";

const swatches = ["#C89B3C", "#3B82F6", "#F6D365", "#FFFFFF", "#0D1117"];
const cornerStyles = ["Rounded", "Square", "Dots"] as const;

export function QrCustomizer({ menuUrl }: { menuUrl: string }) {
  const [color, setColor] = useState(swatches[0]);
  const [corner, setCorner] = useState<(typeof cornerStyles)[number]>("Rounded");
  const [hasLogo, setHasLogo] = useState(true);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <section className="mb-6">
          <h5 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Foreground Color
          </h5>
          <div className="flex gap-2.5">
            {swatches.map((sw) => (
              <button
                key={sw}
                aria-label={`Use color ${sw}`}
                onClick={() => setColor(sw)}
                className={cn(
                  "h-8 w-8 rounded-[9px] border-2 transition-all",
                  color === sw
                    ? "border-white shadow-[0_0_0_2px_theme(colors.void),0_0_0_3px_theme(colors.gold.DEFAULT)]"
                    : "border-transparent",
                )}
                style={{ backgroundColor: sw }}
              />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h5 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Corner Style
          </h5>
          <div className="flex gap-2.5">
            {cornerStyles.map((style) => (
              <button
                key={style}
                onClick={() => setCorner(style)}
                className={cn(
                  "flex-1 rounded-lg border py-3 text-[12px] font-semibold transition-colors",
                  corner === style
                    ? "border-gold bg-gold/[0.08] text-gold"
                    : "border-white/[0.08] text-muted-foreground hover:border-white/20",
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h5 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Logo
          </h5>
          <div className="flex gap-2.5">
            {(["Center Logo", "No Logo"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setHasLogo(opt === "Center Logo")}
                className={cn(
                  "flex-1 rounded-lg border py-3 text-[12px] font-semibold transition-colors",
                  hasLogo === (opt === "Center Logo")
                    ? "border-gold bg-gold/[0.08] text-gold"
                    : "border-white/[0.08] text-muted-foreground hover:border-white/20",
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h5 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Frame Text
          </h5>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-3 text-[13px] text-muted-foreground">
            Scan to view our menu
          </div>
        </section>
      </Card>

      <Card className="flex flex-col items-center p-10">
        <div className="relative h-[260px] w-[260px] rounded-[22px] bg-white p-6">
          <QrGlyph size={9} className="h-full w-full" moduleClassName="!bg-void" finderClassName="" />
          {hasLogo && (
            <span
              className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg shadow-md"
              style={{ backgroundColor: color }}
            >
              <span className="h-2.5 w-2.5 rounded-sm bg-void" />
            </span>
          )}
        </div>
        <p className="mt-[18px] text-[12px] text-muted-foreground">{menuUrl}</p>
        <p className="mt-1 text-[11px] text-muted-foreground/60">
          Style: {corner} · {hasLogo ? "With logo" : "No logo"}
        </p>
        <div className="mt-6 flex w-full gap-2.5">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => toast("SVG export ships with the QR-rendering integration in Phase 2.")}
          >
            Download SVG
          </Button>
          <Button
            variant="gold"
            className="flex-1"
            onClick={() => toast("PNG export ships with the QR-rendering integration in Phase 2.")}
          >
            Download PNG
          </Button>
        </div>
      </Card>
    </div>
  );
}
