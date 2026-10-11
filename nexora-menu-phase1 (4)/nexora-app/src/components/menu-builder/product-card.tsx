"use client";

import { useState, useTransition } from "react";
import { GripVertical, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { toggleProductAvailabilityAction, deleteProductAction } from "@/lib/actions/menu";
import { useRouter } from "@/i18n/routing";
import { ProductImageUploader } from "@/components/menu-builder/product-image-uploader";

export interface ProductCardData {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl: string | null;
  thumb: string; // cosmetic fallback gradient, shown only until a real photo is uploaded
  featured?: boolean;
  available?: boolean;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const router = useRouter();
  const [available, setAvailable] = useState(product.available ?? true);
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  function handleToggle(next: boolean) {
    setAvailable(next); // optimistic
    startTransition(async () => {
      const result = await toggleProductAvailabilityAction(product.id, next);
      if (!result.ok) {
        setAvailable(!next); // revert
        toast.error(result.error ?? "Couldn't update availability.");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setDeleting(true);
    startTransition(async () => {
      const result = await deleteProductAction(product.id);
      if (!result.ok) {
        setDeleting(false);
        toast.error(result.error ?? "Couldn't delete product.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className={`overflow-hidden transition-opacity ${deleting ? "opacity-40" : ""}`}>
      <div
        className={cn(
          "relative h-[120px]",
          !product.imageUrl && `bg-gradient-to-br ${product.thumb}`,
        )}
      >
        <ProductImageUploader
          productId={product.id}
          imageUrl={product.imageUrl}
          className="absolute inset-0 h-full w-full border-0 bg-transparent"
        />

        {product.featured && (
          <Badge variant="solid" className="absolute start-2.5 top-2.5 z-10">
            Featured
          </Badge>
        )}
        <div className="absolute end-2.5 top-2.5 z-10 flex gap-1.5">
          <button
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Delete product"
            className="flex h-6 w-6 items-center justify-center rounded-md bg-void/50 backdrop-blur-sm transition-colors hover:bg-red-500/70"
          >
            {deleting ? (
              <Loader2 className="h-3 w-3 animate-spin text-white" />
            ) : (
              <Trash2 className="h-3 w-3 text-white" />
            )}
          </button>
          <button
            aria-label="Reorder"
            className="flex h-6 w-6 items-center justify-center rounded-md bg-void/50 backdrop-blur-sm"
          >
            <GripVertical className="h-3 w-3 text-white" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h5 className="text-[14px] font-semibold">{product.name}</h5>
          <Switch checked={available} onCheckedChange={handleToggle} disabled={isPending} />
        </div>
        <p className="mb-3 min-h-[33px] text-[11.5px] leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="font-display font-semibold text-gold">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-[11px] text-[#5c6577] line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </Card>
  );
}
