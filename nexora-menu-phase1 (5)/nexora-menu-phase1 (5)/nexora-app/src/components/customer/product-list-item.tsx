import Image from "next/image";
import { Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductListItemProps {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string | null;
  offerBadge?: string | null;
  offerPrice?: number | null;
}

export function ProductListItem({
  name,
  description,
  price,
  oldPrice,
  imageUrl,
  offerBadge,
  offerPrice,
}: ProductListItemProps) {
  const hasOffer = Boolean(offerBadge && offerPrice !== null && offerPrice !== undefined);

  return (
    <div
      className={`relative flex items-center gap-3.5 rounded-2xl border p-3 transition-colors active:border-gold/30 ${
        hasOffer ? "border-gold/30 bg-gold/[0.05]" : "border-white/[0.08] bg-white/[0.04]"
      }`}
    >
      {hasOffer && (
        <span className="absolute -top-2 start-3 flex items-center gap-1 rounded-full bg-gold-gradient px-2.5 py-[3px] text-[10px] font-extrabold text-void shadow-glow-gold">
          <Sparkles className="h-2.5 w-2.5" />
          {offerBadge}
        </span>
      )}
      {imageUrl ? (
        <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-xl">
          <Image src={imageUrl} alt={name} fill sizes="58px" loading="lazy" className="object-cover" />
        </div>
      ) : (
        <span className="h-[58px] w-[58px] shrink-0 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03]" />
      )}
      <div className="min-w-0 flex-1">
        <h5 className="truncate text-[14px] font-semibold">{name}</h5>
        <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0 text-end">
        {hasOffer ? (
          <>
            <div className="font-display text-[14px] font-semibold text-gold">{formatPrice(offerPrice!)}</div>
            <div className="text-[10.5px] text-[#5c6577] line-through">{formatPrice(price)}</div>
          </>
        ) : (
          <>
            <div className="font-display text-[14px] font-semibold text-gold">{formatPrice(price)}</div>
            {oldPrice && (
              <div className="text-[10.5px] text-[#5c6577] line-through">{formatPrice(oldPrice)}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
