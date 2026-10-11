"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Pause, Play, Archive, Loader2, Tag, Percent } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OfferForm, type TargetingOptions } from "@/components/offers/offer-form";
import { setOfferStatusAction, deleteOfferAction, type OfferInput } from "@/lib/actions/offers";
import { useRouter } from "@/i18n/routing";

export interface OfferRow extends OfferInput {
  id: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
}

const STATUS_BADGE = {
  ACTIVE: { variant: "success" as const, label: "Active" },
  PAUSED: { variant: "neutral" as const, label: "Paused" },
  ARCHIVED: { variant: "neutral" as const, label: "Archived" },
};

const TYPE_LABEL: Record<string, string> = {
  HAPPY_HOUR: "Happy Hour",
  COUPON: "Coupon",
  BANNER: "Banner",
};

export function OfferManager({ offers, targeting }: { offers: OfferRow[]; targeting: TargetingOptions }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OfferRow | null>(null);

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  function handleStatus(id: string, status: "ACTIVE" | "PAUSED" | "ARCHIVED") {
    startTransition(async () => {
      const result = await setOfferStatusAction(id, status);
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't update offer.");
        return;
      }
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this offer permanently?")) return;
    startTransition(async () => {
      const result = await deleteOfferAction(id);
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't delete offer.");
        return;
      }
      router.refresh();
    });
  }

  const showingForm = showForm || editing !== null;

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Offers</CardTitle>
            <CardDescription>Happy Hour, coupons, and promotions — shown automatically on your public menu.</CardDescription>
          </div>
          {!showingForm && (
            <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5" />
              New Offer
            </Button>
          )}
        </div>
      </CardHeader>

      <div className="flex flex-col gap-3">
        {offers.length === 0 && !showingForm && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/[0.12] py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/25 bg-gold/[0.08]">
              <Percent className="h-5 w-5 text-gold" />
            </span>
            <p className="max-w-xs text-[13px] text-muted-foreground">
              No offers yet. Create a Happy Hour discount or a coupon and it'll show up on your public menu automatically.
            </p>
          </div>
        )}

        {offers.map((offer) => {
          const badge = STATUS_BADGE[offer.status];
          return (
            <div
              key={offer.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <Tag className="h-4 w-4 text-gold" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h5 className="text-[13.5px] font-semibold">{offer.title}</h5>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <span className="text-[11px] text-muted-foreground">{TYPE_LABEL[offer.type]}</span>
                </div>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {offer.discountType === "PERCENTAGE" ? `${offer.discountValue}% off` : `${offer.discountValue} off`}
                  {offer.code ? ` · code ${offer.code}` : ""}
                  {offer.timeStart && offer.timeEnd ? ` · ${offer.timeStart}–${offer.timeEnd} daily` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {offer.status === "ACTIVE" ? (
                  <IconButton onClick={() => handleStatus(offer.id, "PAUSED")} disabled={isPending} title="Pause">
                    <Pause className="h-3.5 w-3.5" />
                  </IconButton>
                ) : offer.status === "PAUSED" ? (
                  <IconButton onClick={() => handleStatus(offer.id, "ACTIVE")} disabled={isPending} title="Resume">
                    <Play className="h-3.5 w-3.5" />
                  </IconButton>
                ) : null}
                {offer.status !== "ARCHIVED" && (
                  <IconButton onClick={() => handleStatus(offer.id, "ARCHIVED")} disabled={isPending} title="Archive">
                    <Archive className="h-3.5 w-3.5" />
                  </IconButton>
                )}
                <IconButton onClick={() => setEditing(offer)} title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton onClick={() => handleDelete(offer.id)} disabled={isPending} title="Delete" danger>
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </IconButton>
              </div>
            </div>
          );
        })}

        {showingForm && <OfferForm targeting={targeting} initial={editing} onDone={closeForm} />}
      </div>
    </Card>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-colors disabled:opacity-40 ${
        danger ? "hover:border-red-500/40 hover:text-red-400" : "hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
