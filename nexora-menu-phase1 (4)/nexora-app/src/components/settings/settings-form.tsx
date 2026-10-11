"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "@/i18n/routing";
import { updateRestaurantSettingsAction, type RestaurantSettingsInput } from "@/lib/actions/settings";

const CURRENCIES = ["USD", "EUR", "GBP", "EGP", "SAR", "AED"];
const selectClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] text-foreground outline-none focus-visible:border-gold/50";

export function SettingsForm({ initial }: { initial: RestaurantSettingsInput }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  function update<K extends keyof RestaurantSettingsInput>(key: K, value: RestaurantSettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateRestaurantSettingsAction(form);
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't save settings.");
        return;
      }
      toast.success("Settings saved.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Regional</CardTitle>
          <CardDescription>Currency and menu language shown to guests.</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-currency">Currency</Label>
            <select id="s-currency" value={form.currency} onChange={(e) => update("currency", e.target.value)} className={selectClass}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c} className="bg-navy">{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-language">Menu language</Label>
            <select id="s-language" value={form.language} onChange={(e) => update("language", e.target.value as "en" | "ar")} className={selectClass}>
              <option value="en" className="bg-navy">English</option>
              <option value="ar" className="bg-navy">العربية</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Theme</CardTitle>
          <CardDescription>How your public menu appears to guests by default.</CardDescription>
        </CardHeader>
        <div className="flex gap-2.5">
          {(["dark", "light", "auto"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => update("themeMode", mode)}
              className={`flex-1 rounded-lg border py-3 text-[12px] font-semibold capitalize transition-colors ${
                form.themeMode === mode
                  ? "border-gold bg-gold/[0.08] text-gold"
                  : "border-white/[0.08] text-muted-foreground hover:border-white/20"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Taxes & Fees</CardTitle>
          <CardDescription>Optional — leave blank if not applicable.</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-tax">Tax rate (%)</Label>
            <Input
              id="s-tax"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.taxRate ?? ""}
              onChange={(e) => update("taxRate", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-fee">Service fee (%)</Label>
            <Input
              id="s-fee"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.serviceFeePercent ?? ""}
              onChange={(e) => update("serviceFeePercent", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>WhatsApp Ordering</CardTitle>
              <CardDescription>Let guests tap "Order on WhatsApp" from the public menu.</CardDescription>
            </div>
            <Switch checked={form.orderingEnabled} onCheckedChange={(v) => update("orderingEnabled", v)} />
          </div>
        </CardHeader>
        {form.orderingEnabled && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-template">Order message template</Label>
            <textarea
              id="s-template"
              value={form.whatsappOrderTemplate ?? ""}
              onChange={(e) => update("whatsappOrderTemplate", e.target.value)}
              rows={3}
              placeholder="Hi! I'd like to order from your menu."
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-foreground outline-none focus-visible:border-gold/50"
            />
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="gold" disabled={isPending} className="min-w-[140px]">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save settings
        </Button>
      </div>
    </form>
  );
}
