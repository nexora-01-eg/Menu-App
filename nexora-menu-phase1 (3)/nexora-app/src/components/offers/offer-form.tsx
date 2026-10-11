"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/routing";
import { createOfferAction, updateOfferAction, type OfferInput } from "@/lib/actions/offers";

export interface TargetingOptions {
  branches: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  products: { id: string; name: string }[];
}

interface OfferFormProps {
  targeting: TargetingOptions;
  initial?: (OfferInput & { id: string }) | null;
  onDone: () => void;
}

const emptyForm: OfferInput = {
  type: "HAPPY_HOUR",
  title: "",
  description: "",
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 10,
  startDate: "",
  endDate: "",
  timeStart: "",
  timeEnd: "",
  branchId: "",
  productId: "",
  categoryId: "",
};

const selectClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] text-foreground outline-none focus-visible:border-gold/50";

export function OfferForm({ targeting, initial, onDone }: OfferFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<OfferInput>(initial ?? emptyForm);

  function update<K extends keyof OfferInput>(key: K, value: OfferInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = initial
        ? await updateOfferAction({ id: initial.id, ...form })
        : await createOfferAction(form);

      if (!result.ok) {
        toast.error(result.error ?? "Something went wrong.");
        return;
      }
      toast.success(initial ? "Offer updated." : "Offer created.");
      router.refresh();
      onDone();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-gold/25 bg-gold/[0.04] p-5"
    >
      <div className="flex items-center justify-between">
        <h5 className="text-[13px] font-semibold">{initial ? "Edit offer" : "New offer"}</h5>
        <button type="button" onClick={onDone} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="o-type">Offer type</Label>
          <select
            id="o-type"
            value={form.type}
            onChange={(e) => update("type", e.target.value as OfferInput["type"])}
            className={selectClass}
          >
            <option value="HAPPY_HOUR" className="bg-navy">Happy Hour</option>
            <option value="COUPON" className="bg-navy">Coupon</option>
            <option value="BANNER" className="bg-navy">Banner</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="o-title">Title</Label>
          <Input id="o-title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <Label htmlFor="o-desc">Description</Label>
          <Input id="o-desc" value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>

        {form.type === "COUPON" && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="o-code">Coupon code</Label>
            <Input
              id="o-code"
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
              placeholder="SAVE20"
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Label htmlFor="o-dtype">Discount type</Label>
          <select
            id="o-dtype"
            value={form.discountType}
            onChange={(e) => update("discountType", e.target.value as OfferInput["discountType"])}
            className={selectClass}
          >
            <option value="PERCENTAGE" className="bg-navy">Percentage %</option>
            <option value="FIXED" className="bg-navy">Fixed amount</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="o-dvalue">
            Discount value {form.discountType === "PERCENTAGE" ? "(%)" : "(amount)"}
          </Label>
          <Input
            id="o-dvalue"
            type="number"
            min="0"
            step="0.01"
            value={form.discountValue}
            onChange={(e) => update("discountValue", Number(e.target.value))}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="o-start">Start date</Label>
          <Input id="o-start" type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="o-end">End date</Label>
          <Input id="o-end" type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
        </div>

        {form.type === "HAPPY_HOUR" && (
          <>
            <div className="flex flex-col gap-1">
              <Label htmlFor="o-tstart">Daily start time</Label>
              <Input id="o-tstart" type="time" value={form.timeStart} onChange={(e) => update("timeStart", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="o-tend">Daily end time</Label>
              <Input id="o-tend" type="time" value={form.timeEnd} onChange={(e) => update("timeEnd", e.target.value)} />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1">
          <Label htmlFor="o-branch">Branch (optional)</Label>
          <select
            id="o-branch"
            value={form.branchId}
            onChange={(e) => update("branchId", e.target.value)}
            className={selectClass}
          >
            <option value="" className="bg-navy">All branches</option>
            {targeting.branches.map((b) => (
              <option key={b.id} value={b.id} className="bg-navy">{b.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="o-category">Category (optional)</Label>
          <select
            id="o-category"
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className={selectClass}
          >
            <option value="" className="bg-navy">All categories</option>
            {targeting.categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-navy">{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <Label htmlFor="o-product">Product (optional — overrides category)</Label>
          <select
            id="o-product"
            value={form.productId}
            onChange={(e) => update("productId", e.target.value)}
            className={selectClass}
          >
            <option value="" className="bg-navy">All products</option>
            {targeting.products.map((p) => (
              <option key={p.id} value={p.id} className="bg-navy">{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" variant="gold" disabled={isPending} className="self-end">
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {initial ? "Save changes" : "Create offer"}
      </Button>
    </form>
  );
}
