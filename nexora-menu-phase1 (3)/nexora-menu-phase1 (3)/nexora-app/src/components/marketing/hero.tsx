"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { QrGlyph } from "@/components/shared/qr-glyph";
import { AnimatedCounter } from "@/components/shared/animated-counter";

const floatCards = [
  { label: "Truffle Risotto — $28", thumb: "from-[#6b4a2f] to-[#3a2717]", pos: "start-[-6%] top-[6%]", delay: 0 },
  { label: "Live scan +1", thumb: "from-electric to-blue-900", pos: "end-[-8%] bottom-[10%]", delay: 0.4 },
  { label: "Gold Tier Active", thumb: "from-gold-light to-gold", pos: "start-[14%] bottom-[-4%]", delay: 0.8 },
];

export function Hero() {
  const t = useTranslations();

  return (
    <section className="container grid grid-cols-1 items-center gap-14 pb-16 pt-16 md:pt-[70px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/[0.08] px-3.5 py-[7px] text-[11px] font-bold uppercase tracking-[2px] text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_theme(colors.gold.DEFAULT)]" />
          {t("hero.eyebrow")}
        </span>

        <h1 className="font-display text-[clamp(38px,5vw,62px)] font-medium leading-[1.08] tracking-[-1px] text-balance">
          {t("hero.titleLine1")} <span className="gold-text">{t("hero.titleLine2")}</span>
        </h1>

        <p className="mt-5 max-w-[520px] text-[17px] leading-[1.7] text-muted-foreground">
          {t("hero.description")}
        </p>

        <div className="mt-9 flex flex-wrap gap-3.5">
          <Button variant="gold" size="lg" asChild>
            <Link href="/register">{t("common.getStarted")}</Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href="/#showcase">{t("hero.watchDemo")}</Link>
          </Button>
        </div>

        <div className="mt-11 flex gap-8">
          <div>
            <strong className="block font-display text-[22px] font-medium">
              <AnimatedCounter target={12400} compactLabel="12.4k" />
            </strong>
            <span className="text-[12px] text-muted-foreground">{t("hero.restaurantsLive")}</span>
          </div>
          <div>
            <strong className="block font-display text-[22px] font-medium">
              <AnimatedCounter target={8200000} compactLabel="8.2M" />
            </strong>
            <span className="text-[12px] text-muted-foreground">{t("hero.monthlyScans")}</span>
          </div>
          <div>
            <strong className="block font-display text-[22px] font-medium">
              4.9<span className="text-sm">/5</span>
            </strong>
            <span className="text-[12px] text-muted-foreground">{t("hero.averageRating")}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className="relative flex h-[420px] items-center justify-center md:h-[460px]"
      >
        <div className="relative h-[280px] w-[280px] animate-pulse-glow overflow-hidden rounded-[28px] border border-gold/35 bg-gradient-to-br from-slate/95 to-void p-6 shadow-[0_30px_90px_-20px_rgba(200,155,60,0.35),0_0_80px_-10px_rgba(59,130,246,0.15)]">
          <div className="absolute inset-x-[8%] top-[10%] h-0.5 animate-scan bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_12px_theme(colors.gold.DEFAULT)]" />
          <QrGlyph size={7} className="h-full w-full" />
        </div>

        {floatCards.map((card) => (
          <motion.div
            key={card.label}
            className={`glass absolute flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-[12px] font-semibold ${card.pos}`}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: card.delay }}
          >
            <span className={`h-[30px] w-[30px] shrink-0 rounded-[9px] bg-gradient-to-br ${card.thumb}`} />
            {card.label}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
