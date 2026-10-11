"use client";

import { useState } from "react";
import { Search, Sun, Moon, Share2 } from "lucide-react";
import { CustomerHeader } from "@/components/customer/customer-header";
import { CategoryTabs } from "@/components/customer/category-tabs";
import { ProductListItem } from "@/components/customer/product-list-item";
import { WhatsappFab } from "@/components/customer/whatsapp-fab";
import { cn } from "@/lib/utils";

interface MenuProduct {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  thumb: string;
}

interface CustomerMenuViewProps {
  restaurantName: string;
  tagline: string;
  rating: number;
  hoursLabel: string;
  whatsapp: string;
  categories: string[];
  products: MenuProduct[];
}

export function CustomerMenuView({
  restaurantName,
  tagline,
  rating,
  hoursLabel,
  whatsapp,
  categories,
  products,
}: CustomerMenuViewProps) {
  const [active, setActive] = useState(categories[0] ?? "");
  const [query, setQuery] = useState("");
  const [light, setLight] = useState(false);

  const visible = products.filter(
    (p) =>
      p.category === active &&
      (query.trim() === "" || p.name.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div
      className={cn(
        "mx-auto min-h-screen max-w-[480px] border-x border-white/[0.06] pb-28 transition-colors",
        light ? "bg-[#F7F5F0] text-[#171410]" : "bg-void text-foreground",
      )}
    >
      <div className="flex items-center justify-end gap-2 px-5 pt-4">
        <button
          onClick={() => setLight((v) => !v)}
          aria-label="Toggle theme"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
            light ? "border-black/10 bg-black/5" : "border-white/10 bg-white/[0.05]",
          )}
        >
          {light ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>
        <button
          aria-label="Share menu"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
            light ? "border-black/10 bg-black/5" : "border-white/10 bg-white/[0.05]",
          )}
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <CustomerHeader name={restaurantName} tagline={tagline} rating={rating} hoursLabel={hoursLabel} />

      <div className="px-5 py-3.5">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3.5 py-3 text-[13px]",
            light ? "border-black/10 bg-black/[0.03] text-[#6b6558]" : "border-white/[0.08] bg-white/[0.04] text-muted-foreground",
          )}
        >
          <Search className="h-4 w-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the menu…"
            className="w-full bg-transparent outline-none placeholder:text-current"
          />
        </div>
      </div>

      <CategoryTabs categories={categories} active={active} onSelect={setActive} />

      <div className="flex flex-col gap-2.5 px-5 py-4">
        {visible.length === 0 && (
          <p className="py-10 text-center text-[13px] text-muted-foreground">
            No dishes match your search.
          </p>
        )}
        {visible.map((p) => (
          <ProductListItem
            key={p.id}
            name={p.name}
            description={p.description}
            price={p.price}
            oldPrice={p.oldPrice}
            thumb={p.thumb}
          />
        ))}
      </div>

      <WhatsappFab number={whatsapp} />
    </div>
  );
}
