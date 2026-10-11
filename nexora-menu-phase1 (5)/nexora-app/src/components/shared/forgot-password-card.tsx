"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export function ForgotPasswordCard() {
  const t = useTranslations();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteConfig.url}/auth/callback?next=/reset-password`,
    });

    setLoading(false);

    // Don't reveal whether the address exists — always show the same
    // confirmation, and only surface genuine service errors.
    if (authError && authError.status && authError.status >= 500) {
      setError(authError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-8 text-center">
          <CheckCircle2 className="h-9 w-9 text-gold" />
          <h3 className="font-display text-[19px] font-medium">{t("auth.resetLinkSentTitle")}</h3>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {t("auth.resetLinkSentBody")}
          </p>
          <Link href="/login" className="mt-2 text-[13px] font-semibold text-gold hover:underline">
            {t("auth.backToLogin")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 text-center">
        <CardTitle className="font-display text-[22px] font-medium">
          {t("auth.resetPasswordTitle")}
        </CardTitle>
        <CardDescription>{t("auth.resetPasswordSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@restaurant.com"
                className="ps-10"
                required
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" variant="gold" size="lg" disabled={loading} className="mt-1 w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("auth.sendResetLink")}
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          <Link href="/login" className="font-semibold text-gold hover:underline">
            {t("auth.backToLogin")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
