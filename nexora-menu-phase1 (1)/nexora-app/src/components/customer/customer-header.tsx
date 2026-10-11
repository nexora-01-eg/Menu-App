import { Star, Clock } from "lucide-react";

interface CustomerHeaderProps {
  name: string;
  tagline: string;
  rating: number;
  hoursLabel: string;
}

export function CustomerHeader({ name, tagline, rating, hoursLabel }: CustomerHeaderProps) {
  return (
    <header className="border-b border-white/[0.08] px-5 pb-6 pt-10 text-center">
      <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gold-gradient shadow-glow-gold" />
      <h1 className="font-display text-[22px] font-medium">{name}</h1>
      <p className="mt-1 text-[12.5px] text-muted-foreground">{tagline}</p>
      <div className="mt-2.5 flex items-center justify-center gap-3 text-[11.5px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-gold text-gold" /> {rating.toFixed(1)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {hoursLabel}
        </span>
      </div>
    </header>
  );
}
