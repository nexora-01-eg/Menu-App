import { formatPrice } from "@/lib/utils";

interface ProductListItemProps {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  thumb: string;
}

export function ProductListItem({ name, description, price, oldPrice, thumb }: ProductListItemProps) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 transition-colors active:border-gold/30">
      <span className={`h-[58px] w-[58px] shrink-0 rounded-xl bg-gradient-to-br ${thumb}`} />
      <div className="min-w-0 flex-1">
        <h5 className="truncate text-[14px] font-semibold">{name}</h5>
        <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-display text-[14px] font-semibold text-gold">{formatPrice(price)}</div>
        {oldPrice && (
          <div className="text-[10.5px] text-[#5c6577] line-through">{formatPrice(oldPrice)}</div>
        )}
      </div>
    </div>
  );
}
