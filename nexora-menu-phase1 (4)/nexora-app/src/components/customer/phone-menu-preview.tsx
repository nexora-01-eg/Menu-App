import { Search, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewItem {
  name: string;
  desc: string;
  price: string;
  thumb: string; // tailwind gradient classes
}

interface PhoneMenuPreviewProps {
  restaurantName?: string;
  meta?: string;
  categories?: string[];
  activeCategory?: string;
  items: PreviewItem[];
  className?: string;
}

export function PhoneMenuPreview({
  restaurantName = "Lumière Bistro",
  meta = "Open until 11:00 PM · 4.8 ★",
  categories = ["Starters", "Mains", "Desserts", "Drinks"],
  activeCategory = "Starters",
  items,
  className,
}: PhoneMenuPreviewProps) {
  return (
    <div
      className={cn(
        "relative mx-auto h-[570px] w-[280px] rounded-[42px] border border-white/[0.08] bg-gradient-to-br from-[#161b25] to-[#0a0d13] p-3 shadow-premium",
        className,
      )}
    >
      <div className="absolute left-1/2 top-2.5 z-10 h-[18px] w-20 -translate-x-1/2 rounded-xl bg-[#0a0d13]" />
      <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-void">
        <div className="border-b border-white/[0.08] px-4 pb-3.5 pt-8 text-center">
          <div className="mx-auto mb-2 h-[52px] w-[52px] rounded-full bg-gold-gradient" />
          <h4 className="font-display text-[16px] font-medium">{restaurantName}</h4>
          <span className="text-[10.5px] text-muted-foreground">{meta}</span>
        </div>

        <div className="m-3 flex items-center gap-1.5 rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-[11px] text-muted-foreground">
          <Search className="h-3 w-3" />
          Search the menu…
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-3">
          {categories.map((cat) => (
            <span
              key={cat}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-[10.5px] font-semibold",
                cat === activeCategory
                  ? "bg-gold-gradient text-void"
                  : "border border-white/[0.08] bg-white/[0.04] text-muted-foreground",
              )}
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2.5 px-4">
          {items.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2.5 rounded-[14px] border border-white/[0.08] bg-white/[0.04] p-2.5"
            >
              <span className={cn("h-[46px] w-[46px] shrink-0 rounded-[10px] bg-gradient-to-br", item.thumb)} />
              <div className="flex-1">
                <h5 className="text-[12px] font-semibold">{item.name}</h5>
                <p className="mt-0.5 text-[9.5px] text-muted-foreground">{item.desc}</p>
              </div>
              <span className="font-display text-[11px] font-bold text-gold">{item.price}</span>
            </div>
          ))}
        </div>

        <button
          aria-label="Order on WhatsApp"
          className="absolute bottom-4 end-4 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#25D366] shadow-[0_6px_20px_rgba(37,211,102,0.4)]"
        >
          <Phone className="h-5 w-5 fill-white text-white" />
        </button>
      </div>
    </div>
  );
}
