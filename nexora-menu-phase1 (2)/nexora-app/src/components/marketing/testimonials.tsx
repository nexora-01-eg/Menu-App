import { Star } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";

const reviews = [
  {
    quote:
      "We swapped six laminated menus for one QR code. Updates that used to take a week now take thirty seconds.",
    name: "Amara Osei",
    role: "Owner, The Copper Fig",
    thumb: "from-gold-light to-gold",
  },
  {
    quote: "The analytics alone paid for the subscription — we finally know which dishes actually sell.",
    name: "Marco Bellini",
    role: "GM, Bellini's Trattoria",
    thumb: "from-electric to-blue-900",
  },
  {
    quote: "Guests genuinely compliment the menu now. It looks like it belongs in a five-star lounge.",
    name: "Sara Al-Mansoori",
    role: "Founder, Noir Lounge",
    thumb: "from-violet-600 to-violet-950",
  },
];

export function Testimonials() {
  return (
    <section className="container py-24">
      <SectionHeading eyebrow="Testimonials" title="Loved by hospitality teams" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {reviews.map((r) => (
          <div key={r.name} className="glass rounded-xl p-7">
            <div className="mb-4 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
              ))}
            </div>
            <p className="mb-5 text-[14px] leading-relaxed text-muted-foreground">
              &ldquo;{r.quote}&rdquo;
            </p>
            <div className="flex items-center gap-2.5">
              <span className={`h-9 w-9 rounded-full bg-gradient-to-br ${r.thumb}`} />
              <div>
                <strong className="block text-[13px]">{r.name}</strong>
                <span className="text-[11px] text-muted-foreground">{r.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
