"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryListProps {
  categories: { id: string; name: string; count: number }[];
  activeId: string;
  onSelect: (id: string) => void;
  onAddCategory?: () => void;
}

export function CategoryList({ categories, activeId, onSelect, onAddCategory }: CategoryListProps) {
  return (
    <div>
      <div className="flex flex-col gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center justify-between rounded-lg px-3.5 py-3 text-left text-[13px] font-semibold transition-colors",
              activeId === cat.id
                ? "border border-gold/25 bg-gradient-to-r from-gold/[0.15] to-transparent"
                : "border border-transparent text-muted-foreground hover:bg-white/[0.04]",
            )}
          >
            {cat.name}
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-[1px] text-[11px] font-medium">
              {cat.count}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={onAddCategory}
        className="mt-2.5 w-full rounded-lg border border-dashed border-white/[0.12] py-3 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
      >
        <Plus className="mr-1 inline h-3.5 w-3.5" />
        Add Category
      </button>
    </div>
  );
}
