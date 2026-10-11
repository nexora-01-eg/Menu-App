"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkingHoursEditor, DEFAULT_HOURS, type WorkingHours } from "@/components/restaurant-profile/working-hours-editor";
import { updateRestaurantProfileAction } from "@/lib/actions/restaurant-profile";
import { useRouter } from "@/i18n/routing";

interface ProfileFormProps {
  initial: {
    name: string;
    description: string;
    address: string;
    phone: string;
    whatsapp: string;
    website: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    workingHours: WorkingHours;
  };
}

export function RestaurantProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateRestaurantProfileAction(form);
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't save changes.");
        return;
      }
      toast.success("Profile saved.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Shown on your public menu page.</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="name">Restaurant name</Label>
            <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              maxLength={500}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-foreground outline-none focus-visible:border-gold/50"
              placeholder="A short line guests see on your menu — cuisine, vibe, what makes you, you."
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Social</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" value={form.facebook} onChange={(e) => update("facebook", e.target.value)} placeholder="https://" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="https://" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tiktok">TikTok</Label>
            <Input id="tiktok" value={form.tiktok} onChange={(e) => update("tiktok", e.target.value)} placeholder="https://" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>Shown on your public menu — separate from any per-branch hours.</CardDescription>
        </CardHeader>
        <WorkingHoursEditor
          value={form.workingHours}
          onChange={(next) => update("workingHours", next)}
        />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="gold" disabled={isPending} className="min-w-[140px]">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}

export { DEFAULT_HOURS };
