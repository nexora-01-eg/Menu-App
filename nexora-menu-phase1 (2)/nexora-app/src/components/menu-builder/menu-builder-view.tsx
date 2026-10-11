"use client";

import { useMemo, useState } from "react";
import { CategoryList } from "@/components/menu-builder/category-list";
import { ProductCard } from "@/components/menu-builder/product-card";
import { AddProductCard } from "@/components/menu-builder/add-product-card";
import { ProductFormCard } from "@/components/menu-builder/product-form-card";

// No product-image upload yet (Phase 3), so each card gets a stable
// cosmetic gradient derived from its id, purely for visual variety —
// not a stand-in for real photography.
const THUMBS = [
  "from-[#6b4a2f] to-[#3a2717]",
  "from-emerald-600 to-emerald-950",
  "from-electric to-blue-900",
  "from-violet-600 to-violet-950",
  "from-gold-light to-gold",
];
function thumbFor(id: string) {
  const hash = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return THUMBS[hash % THUMBS.length];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

export function MenuBuilderView({ categories }: { categories: Category[] }) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const [showForm, setShowForm] = useState(false);

  const activeCategory = categories.find((c) => c.id === activeId) ?? categories[0];

  const categoryChips = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name, count: c.products.length })),
    [categories],
  );

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.12] p-10 text-center">
        <p className="mb-4 text-[13.5px] text-muted-foreground">
          No categories yet — create your first one to start building the menu.
        </p>
        <div className="mx-auto max-w-[260px]">
          <CategoryList categories={[]} activeId="" onSelect={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[230px_1fr]">
      <CategoryList
        categories={categoryChips}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setShowForm(false);
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {activeCategory?.products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              oldPrice: product.oldPrice,
              imageUrl: product.imageUrl,
              featured: product.isFeatured,
              available: product.isAvailable,
              thumb: thumbFor(product.id),
            }}
          />
        ))}

        {showForm ? (
          <ProductFormCard
            categoryId={activeId}
            onCancel={() => setShowForm(false)}
            onCreated={() => setShowForm(false)}
          />
        ) : (
          <AddProductCard
            categoryName={activeCategory?.name ?? "this category"}
            onClick={() => setShowForm(true)}
          />
        )}
      </div>
    </div>
  );
}
