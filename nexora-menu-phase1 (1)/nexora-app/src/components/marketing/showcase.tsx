import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneMenuPreview } from "@/components/customer/phone-menu-preview";

const checklist = [
  "Instant category navigation and live search",
  "One-tap WhatsApp ordering and direct call",
  "Auto dark / light mode with your brand colors",
  "Shareable menu link for socials and reviews",
];

const previewItems = [
  { name: "Truffle Arancini", desc: "Crisp risotto, wild mushroom", price: "$16", thumb: "from-[#6b4a2f] to-[#3a2717]" },
  { name: "Burrata & Fig", desc: "Aged balsamic, sourdough", price: "$14", thumb: "from-emerald-600 to-emerald-950" },
  { name: "Tuna Tartare", desc: "Yuzu, avocado, sesame", price: "$19", thumb: "from-electric to-blue-900" },
  { name: "Charred Octopus", desc: "Smoked paprika, lemon", price: "$22", thumb: "from-violet-600 to-violet-950" },
];

export function Showcase() {
  return (
    <section id="showcase" className="container py-24">
      <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <PhoneMenuPreview items={previewItems} />

        <div>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/[0.08] px-3.5 py-[7px] text-[11px] font-bold uppercase tracking-[2px] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_theme(colors.gold.DEFAULT)]" />
            Guest Experience
          </span>
          <h2 className="font-display text-[clamp(28px,3.4vw,40px)] font-medium leading-tight tracking-tight">
            A menu that feels
            <br />
            like part of the meal.
          </h2>
          <p className="mt-3.5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Every guest scan opens a fast, beautiful, mobile-first menu — no app download, no
            friction.
          </p>
          <ul className="mt-7 flex flex-col gap-4">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[14px] text-muted-foreground">
                <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
          <Button variant="gold" size="lg" className="mt-8" asChild>
            <Link href="/menu/lumiere-bistro">Preview Customer View →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
