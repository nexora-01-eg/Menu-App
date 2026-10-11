import Image from "next/image";
import { Clock } from "lucide-react";

interface CustomerHeaderProps {
  name: string;
  tagline: string;
  logoUrl?: string | null;
  hoursLabel?: string;
}

export function CustomerHeader({ name, tagline, logoUrl, hoursLabel }: CustomerHeaderProps) {
  return (
    <header className="border-b border-white/[0.08] px-5 pb-6 pt-10 text-center">
      {logoUrl ? (
        <div className="relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full shadow-glow-gold">
          <Image src={logoUrl} alt={name} fill sizes="64px" className="object-cover" />
        </div>
      ) : (
        <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gold-gradient shadow-glow-gold" />
      )}
      <h1 className="font-display text-[22px] font-medium">{name}</h1>
      {tagline && <p className="mt-1 text-[12.5px] text-muted-foreground">{tagline}</p>}
      {hoursLabel && (
        <div className="mt-2.5 flex items-center justify-center gap-1 text-[11.5px] text-muted-foreground">
          <Clock className="h-3 w-3" /> {hoursLabel}
        </div>
      )}
    </header>
  );
}
