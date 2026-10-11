import { AlignLeft, ScanLine, BarChart3, Timer, GitBranch, MoonStar } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";

const features = [
  {
    icon: AlignLeft,
    title: "Menu Builder",
    desc: "Unlimited categories and products with drag-and-drop ordering, offer pricing, and featured items.",
  },
  {
    icon: ScanLine,
    title: "QR Generator",
    desc: "Unlimited branded QR codes — custom colors, embedded logo, rounded styles, PNG or SVG export.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Views, scans, peak hours, device types, and your most-loved dishes — all in one clean report.",
  },
  {
    icon: Timer,
    title: "Happy Hour & Offers",
    desc: "Time-boxed promos, coupon codes, and promo banners that update automatically on schedule.",
  },
  {
    icon: GitBranch,
    title: "Multi-Branch",
    desc: "Manage every location's hours, contacts, and menu from a single restaurant profile.",
  },
  {
    icon: MoonStar,
    title: "Dark & Light Themes",
    desc: "A mobile-first guest menu that adapts to your brand and your guest's preference instantly.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="container py-24">
      <SectionHeading
        eyebrow="Platform"
        title="Everything a modern restaurant needs"
        description="One dashboard to build, brand, and understand your entire dining experience."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="glass rounded-xl p-8 transition-colors hover:border-gold/30">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
              <f.icon className="h-5 w-5 text-gold" strokeWidth={2} />
            </div>
            <h3 className="mb-2 text-[17px] font-semibold">{f.title}</h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
