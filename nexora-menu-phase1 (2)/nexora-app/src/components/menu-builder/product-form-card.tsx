"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "@/i18n/routing";
import { createProductAction } from "@/lib/actions/menu";

interface ProductFormCardProps {
  categoryId: string;
  onCancel: () => void;
  onCreated: () => void;
}

export function ProductFormCard({ categoryId, onCancel, onCreated }: ProductFormCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [featured, setFeatured] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createProductAction({
        categoryId,
        name,
        description,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        isFeatured: featured,
      });
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't create product.");
        return;
      }
      toast.success(`${name} added to the menu.`);
      router.refresh();
      onCreated();
    });
  }

  return (
    <Card className="flex flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <h5 className="text-[13px] font-semibold">New product</h5>
        <button onClick={onCancel} aria-label="Cancel" className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <Label htmlFor="p-name">Name</Label>
          <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="p-desc">Description</Label>
          <Input id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <Label htmlFor="p-price">Price</Label>
            <Input
              id="p-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="p-old">Old price</Label>
            <Input
              id="p-old"
              type="number"
              step="0.01"
              min="0"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/[0.08] px-3 py-2">
          <span className="text-[12.5px] text-muted-foreground">Featured</span>
          <Switch checked={featured} onCheckedChange={setFeatured} />
        </div>
        <Button type="submit" variant="gold" disabled={isPending} className="mt-1">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Add product
        </Button>
      </form>
    </Card>
  );
}
