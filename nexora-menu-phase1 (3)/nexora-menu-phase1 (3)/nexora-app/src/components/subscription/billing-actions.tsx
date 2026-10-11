"use client";

import { useTransition } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createCheckoutSessionAction, createPortalSessionAction } from "@/lib/actions/billing";

export function UpgradeButton({ planId, label }: { planId: string; label: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await createCheckoutSessionAction(planId);
      if (!result.ok || !result.url) {
        toast.error(result.error ?? "Couldn't start checkout.");
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <Button variant="gold" className="w-full" onClick={handleClick} disabled={isPending}>
      {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
}

export function ManageBillingButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await createPortalSessionAction();
      if (!result.ok || !result.url) {
        toast.error(result.error ?? "Couldn't open the billing portal.");
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <Button variant="ghost" onClick={handleClick} disabled={isPending} className="gap-1.5">
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
      Manage Billing
    </Button>
  );
}
