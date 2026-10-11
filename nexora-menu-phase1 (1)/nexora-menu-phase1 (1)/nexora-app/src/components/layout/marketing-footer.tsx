import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { PoweredByNexora } from "@/components/shared/powered-by-nexora";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "Menu Builder", href: "/#features" },
      { label: "QR Studio", href: "/#features" },
      { label: "Analytics", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.08] px-6 pb-8 pt-16 md:px-10">
      <div className="container grid grid-cols-1 gap-10 pb-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo className="mb-4" />
          <p className="max-w-[280px] text-[13px] leading-relaxed text-muted-foreground">
            The luxury digital menu platform for restaurants, cafés, and lounges.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <h5 className="mb-4 text-[12px] uppercase tracking-wider text-muted-foreground">
              {col.heading}
            </h5>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-muted-foreground transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container flex flex-col gap-4 border-t border-white/[0.08] pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} NEXORA Menu. All rights reserved.</span>
        <PoweredByNexora />
      </div>
    </footer>
  );
}
