"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CategoryList } from "@/components/menu-builder/category-list";
import { ProductCard, type ProductCardData } from "@/components/menu-builder/product-card";
import { AddProductCard } from "@/components/menu-builder/add-product-card";

interface Category {
  id: string;
  name: string;
}

interface MenuBuilderViewProps {
  categories: Category[];
  productsByCategory: Record<string, ProductCardData[]>;
}

export function MenuBuilderView({ categories, productsByCategory }: MenuBuilderViewProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");

  const activeCategory = categories.find((c) => c.id === activeId) ?? categories[0];
  const products = productsByCategory[activeId] ?? [];

  const categoryChips = useMemo(
    () => categories.map((c) => ({ ...c, count: productsByCategory[c.id]?.length ?? 0 })),
    [categories, productsByCategory],
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[230px_1fr]">
      <CategoryList
        categories={categoryChips}
        activeId={activeId}
        onSelect={setActiveId}
        onAddCategory={() => toast("Category creation ships in Phase 2 — Menu CRUD.")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        <AddProductCard categoryName={activeCategory?.name ?? "this category"} />
      </div>
    </div>
  );
}
