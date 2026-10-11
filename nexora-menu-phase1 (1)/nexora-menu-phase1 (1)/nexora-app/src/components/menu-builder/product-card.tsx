"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  thumb: string; // gradient classes
  featured?: boolean;
  available?: boolean;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const [available, setAvailable] = useState(product.available ?? true);

  return (
    <Card className="overflow-hidden">
      <div className={`relative h-[120px] bg-gradient-to-br ${product.thumb}`}>
        {product.featured && (
          <Badge variant="solid" className="absolute left-2.5 top-2.5">
            Featured
          </Badge>
        )}
        <button
          aria-label="Reorder"
          className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-md bg-void/50 backdrop-blur-sm"
        >
          <GripVertical className="h-3 w-3 text-white" />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h5 className="text-[14px] font-semibold">{product.name}</h5>
          <Switch checked={available} onCheckedChange={setAvailable} />
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
