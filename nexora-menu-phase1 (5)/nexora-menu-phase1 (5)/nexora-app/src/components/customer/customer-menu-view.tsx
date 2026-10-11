"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Sun, Moon, Share2 } from "lucide-react";
import { CustomerHeader } from "@/components/customer/customer-header";
import { CategoryTabs } from "@/components/customer/category-tabs";
import { ProductListItem } from "@/components/customer/product-list-item";
import { WhatsappFab } from "@/components/customer/whatsapp-fab";
import { CouponInput, type AppliedCoupon } from "@/components/customer/coupon-input";
import { computeDiscountedPrice, formatOfferBadge } from "@/lib/offers-engine";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/client";

interface MenuCategory {
  id: string;
  name: string;
}

interface MenuProduct {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl: string | null;
  offerBadge?: string | null;
  offerPrice?: number | null;
}

interface CustomerMenuViewProps {
  restaurantSlug: string;
  restaurantName: string;
  tagline: string;
  logoUrl?: string | null;
  openStatusLabel?: string | null;
  whatsapp: string;
  orderingEnabled?: boolean;
  whatsappOrderTemplate?: string | null;
  categories: MenuCategory[];
  products: MenuProduct[];
}

export function CustomerMenuView({
  restaurantSlug,
  restaurantName,
  tagline,
  logoUrl,
  openStatusLabel,
  whatsapp,
  orderingEnabled = true,
  whatsappOrderTemplate,
  categories,
  products,
}: CustomerMenuViewProps) {
  const searchParams = useSearchParams();
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [light, setLight] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  // Menu-open + QR-scan tracking, fired once per browser tab.
  useEffect(() => {
    track(restaurantSlug, "VIEW", { oncePerSession: true });
    if (searchParams.get("src") === "qr") {
      track(restaurantSlug, "SCAN", { oncePerSession: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantSlug]);

  // Debounced search tracking — only fire after the visitor pauses typing.
  useEffect(() => {
    if (query.trim().length < 2) return;
    const t = setTimeout(() => track(restaurantSlug, "SEARCH", { query: query.trim() }), 900);
    return () => clearTimeout(t);
  }, [query, restaurantSlug]);

  function handleSelectCategory(id: string) {
    setActive(id);
    track(restaurantSlug, "CATEGORY_VIEW", { categoryId: id });
  }

  function handleProductClick(productId: string) {
    track(restaurantSlug, "PRODUCT_CLICK", { productId });
  }

  const visible = useMemo(
    () =>
      products
        .filter(
          (p) =>
            p.categoryId === active &&
            (query.trim() === "" || p.name.toLowerCase().includes(query.toLowerCase())),
        )
        .map((p) => {
          if (!coupon) return p;
          const targets = coupon.productId ? coupon.productId === p.id : coupon.categoryId ? coupon.categoryId === p.categoryId : true;
          if (!targets) return p;
          return {
            ...p,
            offerBadge: formatOfferBadge(coupon),
            offerPrice: computeDiscountedPrice(p.price, coupon),
          };
        }),
    [products, active, query, coupon],
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
          onClick={() => {
            track(restaurantSlug, "SHARE");
            if (navigator.share) {
              navigator.share({ title: restaurantName, url: window.location.href }).catch(() => {});
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          aria-label="Share menu"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
            light ? "border-black/10 bg-black/5" : "border-white/10 bg-white/[0.05]",
          )}
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <CustomerHeader name={restaurantName} tagline={tagline} logoUrl={logoUrl} hoursLabel={openStatusLabel ?? undefined} />

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

      <CouponInput restaurantSlug={restaurantSlug} applied={coupon} onApply={setCoupon} light={light} />

      <CategoryTabs
        categories={categories.map((c) => c.name)}
        active={categories.find((c) => c.id === active)?.name ?? ""}
        onSelect={(name) => {
          const cat = categories.find((c) => c.name === name);
          if (cat) handleSelectCategory(cat.id);
        }}
      />

      <div className="flex flex-col gap-2.5 px-5 py-4">
        {categories.length === 0 && (
          <p className="py-10 text-center text-[13px] text-muted-foreground">
            This menu doesn't have any published items yet.
          </p>
        )}
        {visible.length === 0 && categories.length > 0 && (
          <p className="py-10 text-center text-[13px] text-muted-foreground">
            No dishes match your search.
          </p>
        )}
        {visible.map((p) => (
          <button key={p.id} onClick={() => handleProductClick(p.id)} className="text-start">
            <ProductListItem
              name={p.name}
              description={p.description}
              price={p.price}
              oldPrice={p.oldPrice}
              imageUrl={p.imageUrl}
              offerBadge={p.offerBadge}
              offerPrice={p.offerPrice}
            />
          </button>
        ))}
      </div>

      {orderingEnabled && whatsapp && (
        <WhatsappFab
          number={whatsapp}
          message={
            (whatsappOrderTemplate || `Hi! I'd like to order from your menu.`) +
            (coupon ? ` (Coupon: ${coupon.title})` : "")
          }
          onClick={() => track(restaurantSlug, "WHATSAPP_CLICK")}
        />
      )}
    </div>
  );
}
