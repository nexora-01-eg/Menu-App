"use client";

import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: string[];
  active: string;
  onSelect: (c: string) => void;
}

export function CategoryTabs({ categories, active, onSelect }: CategoryTabsProps) {
  return (
    <div className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-white/[0.08] bg-void/85 px-5 py-3 backdrop-blur-xl">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors",
            active === cat
              ? "bg-gold-gradient text-void shadow-glow-gold"
              : "border border-white/[0.08] bg-white/[0.04] text-muted-foreground",
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
