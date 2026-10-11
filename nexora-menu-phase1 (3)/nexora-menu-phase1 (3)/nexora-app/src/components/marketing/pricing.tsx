import { Check } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { plans } from "@/config/plans";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="container py-24">
      <SectionHeading
        eyebrow="Pricing"
        title="Plans for every kitchen"
        description="Start free. Upgrade the moment you need more branches, more branding, or deeper analytics."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "glass relative flex flex-col rounded-xl p-6",
              plan.highlight && "-translate-y-2 border-gold/60 bg-gradient-to-b from-gold/[0.12] to-gold/[0.02]",
            )}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-extrabold tracking-wide text-void">
                Most Popular
              </span>
            )}
            <h4 className="text-[13px] font-bold uppercase tracking-wide text-muted-foreground">
              {plan.name}
            </h4>
            <div className="mt-3.5 font-display text-[32px]">
              {plan.price === null ? (
                "Custom"
              ) : plan.highlight ? (
                <span className="gold-text">${plan.price}</span>
              ) : (
                <>${plan.price}</>
              )}
              {plan.price !== null && (
                <span className="ms-1 font-sans text-[13px] text-muted-foreground">/mo</span>
              )}
            </div>
            <ul className="my-5 flex flex-1 flex-col gap-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  <Check className="h-[13px] w-[13px] shrink-0 text-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant={plan.highlight ? "gold" : "ghost"} className="w-full">
              {plan.price === null ? "Contact Sales" : `Choose ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
