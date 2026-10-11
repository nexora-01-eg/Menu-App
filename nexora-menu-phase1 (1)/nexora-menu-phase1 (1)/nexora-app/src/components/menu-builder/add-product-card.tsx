import { Plus } from "lucide-react";

export function AddProductCard({ categoryName }: { categoryName: string }) {
  return (
    <button className="flex min-h-[220px] flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-white/[0.12] text-[12.5px] font-semibold text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12]">
        <Plus className="h-4 w-4" />
      </span>
      Add a product to {categoryName}
    </button>
  );
}
