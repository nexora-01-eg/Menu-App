"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

interface AuthCardProps {
  mode: "login" | "register";
}

export function AuthCard({ mode }: AuthCardProps) {
  // Root-level translator so this one component can pull from both
  // the "auth" and "common" namespaces via dotted keys.
  const t = useTranslations();
  const locale = useLocale();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isRegister = mode === "register";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = isRegister
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${siteConfig.url}/auth/callback?next=/dashboard`,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // The (dashboard) layout checks for a restaurant and bounces
    // first-time users to /onboarding automatically.
    //
    // A full navigation (not the client-side router) is deliberate
    // here: chaining router.push()+router.refresh() right after a
    // Supabase auth state change raced against next-intl's client
    // router and produced a broken "/undefinedundefined" URL. A hard
    // navigation is also simply more correct after login/register —
    // it guarantees the new auth cookie is picked up on the very
    // first server render of the dashboard.
    window.location.href = locale === "en" ? "/dashboard" : `/${locale}/dashboard`;
  }

  return (
    <Card>
      <CardHeader className="pb-2 text-center">
        <CardTitle className="font-display text-[22px] font-medium">
          {isRegister ? t("auth.registerTitle") : t("auth.loginTitle")}
        </CardTitle>
        <CardDescription>
          {isRegister ? t("auth.registerSubtitle") : t("auth.loginSubtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">{t("auth.fullName")}</Label>
              <div className="relative">
                <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Amara Osei"
                  className="ps-10"
                  required
                />
              </div>
            </div>
          )}

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

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("auth.password")}</Label>
              {!isRegister && (
                <Link
                  href="/forgot-password"
                  className="text-[11.5px] font-semibold text-gold hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              )}
            </div>
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

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" variant="gold" size="lg" disabled={loading} className="mt-1 w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRegister ? t("auth.createAccount") : t("common.signIn")}
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          {isRegister ? (
            <>
              {t("auth.haveAccount")}{" "}
              <Link href="/login" className="font-semibold text-gold hover:underline">
                {t("common.signIn")}
              </Link>
            </>
          ) : (
            <>
              {t("auth.noAccount")}{" "}
              <Link href="/register" className="font-semibold text-gold hover:underline">
                {t("auth.startFree")}
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
