"use client";

import { useState, useTransition } from "react";
import { Globe, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { siteConfig } from "@/config/site";
import { togglePublishAction } from "@/lib/actions/restaurant-profile";
import { useRouter } from "@/i18n/routing";

export function PublishToggleCard({ slug, isPublished }: { slug: string; isPublished: boolean }) {
  const router = useRouter();
  const [published, setPublished] = useState(isPublished);
  const [isPending, startTransition] = useTransition();

  const menuUrl = `${siteConfig.url}/menu/${slug}`;

  function handleToggle(next: boolean) {
    setPublished(next);
    startTransition(async () => {
      const result = await togglePublishAction(next);
      if (!result.ok) {
        setPublished(!next);
        toast.error(result.error ?? "Couldn't update.");
        return;
      }
      toast.success(next ? "Your menu is live." : "Your menu is now hidden from guests.");
      router.refresh();
    });
  }

  return (
    <Card className="mb-5 flex flex-wrap items-center justify-between gap-3 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
          <Globe className="h-4.5 w-4.5 text-gold" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h5 className="text-[13.5px] font-semibold">{published ? "Menu is live" : "Menu is hidden"}</h5>
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          </div>
          {published ? (
            <a
              href={`/menu/${slug}`}
              target="_blank"
              className="flex items-center gap-1 text-[12px] text-gold hover:underline"
            >
              {menuUrl} <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <p className="text-[12px] text-muted-foreground">Publish to make it visible to guests.</p>
          )}
        </div>
      </div>
      <Switch checked={published} onCheckedChange={handleToggle} disabled={isPending} />
    </Card>
  );
}
