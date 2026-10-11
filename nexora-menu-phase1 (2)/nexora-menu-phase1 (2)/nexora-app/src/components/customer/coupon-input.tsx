"use client";

import { useState } from "react";
import { Tag, Loader2, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppliedCoupon {
  id: string;
  title: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  productId: string | null;
  categoryId: string | null;
}

interface CouponInputProps {
  restaurantSlug: string;
  applied: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon | null) => void;
  light?: boolean;
}

export function CouponInput({ restaurantSlug, applied, onApply, light }: CouponInputProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantSlug, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "That code didn't work.");
        setLoading(false);
        return;
      }
      onApply(data.offer);
      setOpen(false);
      setCode("");
    } catch {
      setError("Couldn't check that code — try again.");
    }
    setLoading(false);
  }

  if (applied) {
    return (
      <div className="mx-5 mb-1 flex items-center justify-between rounded-xl border border-gold/30 bg-gold/[0.08] px-3.5 py-2.5 text-[12px]">
        <span className="flex items-center gap-2 font-semibold text-gold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          "{applied.title}" applied
        </span>
        <button onClick={() => onApply(null)} aria-label="Remove coupon" className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-5">
      {open ? (
        <form onSubmit={handleSubmit} className="mb-1 flex flex-col gap-1.5">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              autoFocus
              className={cn(
                "h-10 flex-1 rounded-lg border px-3 text-[12.5px] outline-none",
                light ? "border-black/10 bg-black/[0.03] text-[#171410]" : "border-white/[0.08] bg-white/[0.04] text-foreground",
              )}
            />
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 items-center justify-center rounded-lg bg-gold-gradient px-4 text-[12px] font-bold text-void"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
            </button>
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-gold"
        >
          <Tag className="h-3.5 w-3.5" />
          Have a coupon code?
        </button>
      )}
    </div>
  );
}
