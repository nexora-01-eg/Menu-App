"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2, ChevronLeft, ChevronRight, Store } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils";
import { createRestaurantAction, type OnboardingInput } from "@/lib/actions/restaurant";

const BUSINESS_TYPES = ["restaurant", "cafe", "lounge", "cloudKitchen", "foodTruck"] as const;
const CURRENCIES = ["USD", "EUR", "GBP", "EGP", "SAR", "AED"];
const TIMEZONES = [
  "UTC",
  "Africa/Cairo",
  "Asia/Riyadh",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
];

const TOTAL_STEPS = 3;

export function OnboardingWizard() {
  const t = useTranslations();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    restaurantName: "",
    businessType: "restaurant",
    phone: "",
    whatsapp: "",
    address: "",
    country: "",
    currency: "USD",
    language: "en",
    timezone: "UTC",
  });

  const slugPreview = useMemo(
    () => slugify(form.restaurantName) || "your-restaurant",
    [form.restaurantName],
  );

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function next() {
    if (step === 1 && form.restaurantName.trim().length < 2) {
      toast.error(t("onboarding.step1Title"));
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleFinish() {
    startTransition(async () => {
      const input: OnboardingInput = { ...form };
      const result = await createRestaurantAction(input);
      // On success the action itself calls redirect("/dashboard"),
      // which surfaces here as a thrown redirect signal — so a
      // returned value only ever means something went wrong.
      if (result && !result.ok) {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <Card className="w-full max-w-[480px]">
      <CardHeader className="pb-2">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
            <Store className="h-4 w-4 text-gold" />
          </span>
          <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("onboarding.step", { current: step, total: TOTAL_STEPS })}
          </span>
        </div>
        <div className="mb-1 flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < step ? "bg-gold-gradient" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <CardTitle className="mt-3 font-display text-[21px] font-medium">
          {step === 1 && t("onboarding.step1Title")}
          {step === 2 && t("onboarding.step2Title")}
          {step === 3 && t("onboarding.step3Title")}
        </CardTitle>
        <CardDescription>
          {step === 1 && t("onboarding.step1Subtitle")}
          {step === 2 && t("onboarding.step2Subtitle")}
          {step === 3 && t("onboarding.step3Subtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {step === 1 && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="restaurantName">{t("onboarding.restaurantName")}</Label>
              <Input
                id="restaurantName"
                value={form.restaurantName}
                onChange={(e) => update("restaurantName", e.target.value)}
                placeholder="Lumière Bistro"
                autoFocus
              />
              <p className="text-[11.5px] text-muted-foreground">
                {t("onboarding.slugHint", { slug: slugPreview })}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="businessType">{t("onboarding.businessType")}</Label>
              <select
                id="businessType"
                value={form.businessType}
                onChange={(e) => update("businessType", e.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm text-foreground focus-visible:border-gold/50 focus-visible:outline-none"
              >
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-navy">
                    {t(`onboarding.businessTypes.${type}`)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">{t("onboarding.phone")}</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+1 555 123 4567"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsapp">{t("onboarding.whatsapp")}</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="+1 555 123 4567"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">{t("onboarding.address")}</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="1 Nile Corniche, Cairo"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="country">{t("onboarding.country")}</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                placeholder="Egypt"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currency">{t("onboarding.currency")}</Label>
              <select
                id="currency"
                value={form.currency}
                onChange={(e) => update("currency", e.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm text-foreground focus-visible:border-gold/50 focus-visible:outline-none"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} className="bg-navy">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="language">{t("onboarding.language")}</Label>
              <select
                id="language"
                value={form.language}
                onChange={(e) => update("language", e.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm text-foreground focus-visible:border-gold/50 focus-visible:outline-none"
              >
                <option value="en" className="bg-navy">English</option>
                <option value="ar" className="bg-navy">العربية</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="timezone">{t("onboarding.timezone")}</Label>
              <select
                id="timezone"
                value={form.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm text-foreground focus-visible:border-gold/50 focus-visible:outline-none"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} className="bg-navy">
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="mt-2 flex gap-3">
          {step > 1 && (
            <Button variant="ghost" onClick={back} disabled={isPending} className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              {t("onboarding.back")}
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button variant="gold" onClick={next} className="flex-1 gap-1">
              {t("onboarding.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="gold" onClick={handleFinish} disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? t("onboarding.creating") : t("onboarding.finish")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
