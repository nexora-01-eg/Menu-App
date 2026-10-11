"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { MailCheck, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { resendVerificationEmailAction } from "@/lib/actions/verify-email";

export function VerifyEmailCard({ email }: { email: string }) {
  const locale = useLocale();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(false);

  function handleResend() {
    setCooldown(true);
    startTransition(async () => {
      const result = await resendVerificationEmailAction();
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't resend the email.");
        setCooldown(false);
        return;
      }
      toast.success("Verification email sent.");
      setTimeout(() => setCooldown(false), 30_000);
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = locale === "en" ? "/login" : `/${locale}/login`;
  }

  return (
    <Card>
      <CardHeader className="pb-2 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/[0.08]">
          <MailCheck className="h-5 w-5 text-gold" />
        </div>
        <CardTitle className="font-display text-[21px] font-medium">Confirm your email</CardTitle>
        <CardDescription>
          We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click it,
          then come back here.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button variant="gold" onClick={handleResend} disabled={isPending || cooldown} className="w-full">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {cooldown ? "Sent — check your inbox" : "Resend email"}
        </Button>
        <Button variant="ghost" onClick={handleSignOut} className="w-full gap-1.5">
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
