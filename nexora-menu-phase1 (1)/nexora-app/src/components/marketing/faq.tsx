"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Do guests need to download an app?",
    a: "No — the menu opens instantly in any phone browser after a QR scan. Nothing to install.",
  },
  {
    q: "Can I change prices in real time?",
    a: "Yes. Any edit in the Menu Builder is live on every guest's menu within seconds.",
  },
  {
    q: "Does NEXORA support multiple branches?",
    a: "Pro and above support multiple branches, each with its own hours, contact details, and QR code.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, all plans are month-to-month with no long-term contract.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="container py-24">
      <SectionHeading eyebrow="FAQ" title="Common questions" />
      <div className="mx-auto flex max-w-[760px] flex-col gap-3">
        {faqs.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q} className="glass overflow-hidden rounded-xl">
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left text-[14.5px] font-semibold"
                aria-expanded={open}
              >
                {item.q}
                <Plus
                  className={cn("h-4 w-4 shrink-0 text-gold transition-transform duration-300", open && "rotate-45")}
                />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-[13.5px] leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
