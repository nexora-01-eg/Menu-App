"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ResetPasswordCard() {
  const t = useTranslations();
  const locale = useLocale();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setLoading(true);
    // Supabase reads the recovery token from the URL fragment that
    // its email link appended, and exchanges it for a session
    // automatically before this component mounts client-side.
    const { error: authError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    window.location.href = locale === "en" ? "/dashboard" : `/${locale}/dashboard`;
  }

  return (
    <Card>
      <CardHeader className="pb-2 text-center">
        <CardTitle className="font-display text-[22px] font-medium">
          {t("auth.newPasswordTitle")}
        </CardTitle>
        <CardDescription>{t("auth.newPasswordSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("auth.newPassword")}</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="ps-10"
                minLength={8}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm">{t("auth.confirmPassword")}</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="ps-10"
                minLength={8}
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
            {t("auth.updatePassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
