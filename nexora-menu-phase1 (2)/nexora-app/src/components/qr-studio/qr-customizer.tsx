"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveQrCodeAction } from "@/lib/actions/qr";

const swatches = ["#C89B3C", "#3B82F6", "#F6D365", "#FFFFFF", "#0D1117"];
const cornerStyles = [
  { id: "rounded", label: "Rounded Frame" },
  { id: "square", label: "Square Frame" },
] as const;
const errorLevels = [
  { id: "M", label: "Standard (M)" },
  { id: "H", label: "High — for logos (H)" },
] as const;

interface Branch {
  id: string;
  name: string;
}

interface QrCustomizerProps {
  restaurantSlug: string;
  restaurantName: string;
  logoUrl: string | null;
  branches: Branch[];
}

const CANVAS_SIZE = 600; // rendered at high-res, downscaled by CSS for preview

export function QrCustomizer({ restaurantSlug, restaurantName, logoUrl, branches }: QrCustomizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(swatches[0]);
  const [corner, setCorner] = useState<(typeof cornerStyles)[number]["id"]>("rounded");
  const [hasLogo, setHasLogo] = useState(Boolean(logoUrl));
  const [errorLevel, setErrorLevel] = useState<(typeof errorLevels)[number]["id"]>(
    logoUrl ? "H" : "M",
  );
  const [branchId, setBranchId] = useState<string | null>(branches[0]?.id ?? null);
  const [isSaving, startSaving] = useTransition();
  const [isRendering, setIsRendering] = useState(true);

  const menuUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/menu/${restaurantSlug}${
    branchId ? `?src=qr&branch=${branchId}` : "?src=qr"
  }`;

  // Re-render the real QR onto the canvas whenever any option changes.
  useEffect(() => {
    let cancelled = false;
    setIsRendering(true);

    async function render() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCode.toCanvas(canvas, menuUrl, {
        width: CANVAS_SIZE,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: { dark: color === "#FFFFFF" ? "#0D1117" : color, light: "#FFFFFF" },
      });

      const ctx = canvas.getContext("2d");
      if (ctx && hasLogo && logoUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = logoUrl;
        });
        if (!cancelled && img.complete && img.naturalWidth > 0) {
          const logoSize = CANVAS_SIZE * 0.22;
          const pad = logoSize * 0.16;
          const x = (CANVAS_SIZE - logoSize) / 2;
          const y = (CANVAS_SIZE - logoSize) / 2;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2);
          ctx.drawImage(img, x, y, logoSize, logoSize);
        }
      }

      if (ctx && corner === "rounded") {
        // Round just the outer frame corners of the exported image —
        // the scannable modules themselves stay square (a true
        // dot-matrix module style needs a dedicated QR-styling
        // library we haven't added yet; see the Production Report).
        const radius = CANVAS_SIZE * 0.06;
        ctx.globalCompositeOperation = "destination-in";
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.arcTo(CANVAS_SIZE, 0, CANVAS_SIZE, CANVAS_SIZE, radius);
        ctx.arcTo(CANVAS_SIZE, CANVAS_SIZE, 0, CANVAS_SIZE, radius);
        ctx.arcTo(0, CANVAS_SIZE, 0, 0, radius);
        ctx.arcTo(0, 0, CANVAS_SIZE, 0, radius);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }

      if (!cancelled) setIsRendering(false);
    }

    render().catch(() => setIsRendering(false));
    return () => {
      cancelled = true;
    };
  }, [menuUrl, color, corner, hasLogo, logoUrl, errorLevel]);

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${restaurantSlug}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function downloadSvg() {
    const svgString = await QRCode.toString(menuUrl, {
      type: "svg",
      margin: 2,
      errorCorrectionLevel: errorLevel,
      color: { dark: color === "#FFFFFF" ? "#0D1117" : color, light: "#FFFFFF" },
    });
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${restaurantSlug}-qr.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pdf = new jsPDF({ unit: "pt", format: [360, 460] });
    pdf.setFillColor(5, 5, 5);
    pdf.rect(0, 0, 360, 460, "F");
    pdf.setTextColor(233, 233, 238);
    pdf.setFontSize(16);
    pdf.text(restaurantName, 180, 40, { align: "center" });
    pdf.setFontSize(10);
    pdf.setTextColor(144, 153, 168);
    pdf.text("Scan to view our menu", 180, 58, { align: "center" });
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 60, 80, 240, 240);
    pdf.save(`${restaurantSlug}-qr.pdf`);
  }

  function handleSave() {
    startSaving(async () => {
      const result = await saveQrCodeAction({
        branchId,
        label: branches.find((b) => b.id === branchId)?.name ?? "Restaurant Menu",
        fgColor: color,
        cornerStyle: corner,
        hasLogo,
        errorCorrectionLevel: errorLevel,
      });
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't save this QR code.");
        return;
      }
      toast.success("QR code saved.");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="p-6">
        {branches.length > 1 && (
          <section className="mb-6">
            <h5 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              Branch
            </h5>
            <select
              value={branchId ?? ""}
              onChange={(e) => setBranchId(e.target.value || null)}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] text-foreground outline-none focus-visible:border-gold/50"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-navy">
                  {b.name}
                </option>
              ))}
            </select>
          </section>
        )}

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
            Frame Style
          </h5>
          <div className="flex gap-2.5">
            {cornerStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setCorner(style.id)}
                className={cn(
                  "flex-1 rounded-lg border py-3 text-[12px] font-semibold transition-colors",
                  corner === style.id
                    ? "border-gold bg-gold/[0.08] text-gold"
                    : "border-white/[0.08] text-muted-foreground hover:border-white/20",
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h5 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Logo
          </h5>
          <div className="flex gap-2.5">
            <button
              onClick={() => setHasLogo(true)}
              disabled={!logoUrl}
              className={cn(
                "flex-1 rounded-lg border py-3 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                hasLogo ? "border-gold bg-gold/[0.08] text-gold" : "border-white/[0.08] text-muted-foreground hover:border-white/20",
              )}
            >
              Center Logo
            </button>
            <button
              onClick={() => setHasLogo(false)}
              className={cn(
                "flex-1 rounded-lg border py-3 text-[12px] font-semibold transition-colors",
                !hasLogo ? "border-gold bg-gold/[0.08] text-gold" : "border-white/[0.08] text-muted-foreground hover:border-white/20",
              )}
            >
              No Logo
            </button>
          </div>
          {!logoUrl && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Upload a logo in Restaurant Profile to enable this.
            </p>
          )}
        </section>

        <section>
          <h5 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Error Correction
          </h5>
          <div className="flex gap-2.5">
            {errorLevels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setErrorLevel(lvl.id)}
                className={cn(
                  "flex-1 rounded-lg border py-3 text-[12px] font-semibold transition-colors",
                  errorLevel === lvl.id
                    ? "border-gold bg-gold/[0.08] text-gold"
                    : "border-white/[0.08] text-muted-foreground hover:border-white/20",
                )}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </section>
      </Card>

      <Card className="flex flex-col items-center p-10">
        <div className="relative h-[260px] w-[260px] overflow-hidden rounded-[22px] bg-white">
          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="h-full w-full" />
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-5 w-5 animate-spin text-gold" />
            </div>
          )}
        </div>
        <p className="mt-[18px] break-all text-center text-[11px] text-muted-foreground">{menuUrl}</p>

        <div className="mt-6 flex w-full gap-2.5">
          <Button variant="ghost" className="flex-1" onClick={downloadSvg}>
            SVG
          </Button>
          <Button variant="ghost" className="flex-1" onClick={downloadPdf}>
            PDF
          </Button>
          <Button variant="gold" className="flex-1" onClick={downloadPng}>
            PNG
          </Button>
        </div>
        <Button variant="ghost" className="mt-2.5 w-full" onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save this style
        </Button>
      </Card>
    </div>
  );
}
