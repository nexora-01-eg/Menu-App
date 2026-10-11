"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { marketingNav } from "@/config/site";
import { cn } from "@/lib/utils";

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-void/70 backdrop-blur-2xl">
      <div className="container flex h-[65px] items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 md:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="solid" size="sm" asChild>
            <Link href="/register">Start Free Trial</Link>
          </Button>
        </div>

        <button
          className="p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "grid overflow-hidden border-t border-white/[0.08] transition-[grid-template-rows] duration-300 md:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="container flex flex-col gap-1 py-4">
            {marketingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="gold" size="sm" className="flex-1" asChild>
                <Link href="/register">Start Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
