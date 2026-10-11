export const siteConfig = {
  name: "NEXORA",
  productName: "NEXORA Menu",
  tagline: "The menu, reimagined for modern dining.",
  description:
    "NEXORA turns a single QR code into a living menu — instant updates, real-time analytics, and a guest experience that feels as premium as your kitchen.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/nexoramenu",
    instagram: "https://instagram.com/nexoramenu",
  },
} as const;

export const marketingNavKeys = [
  { key: "product", href: "/#features" },
  { key: "showcase", href: "/#showcase" },
  { key: "pricing", href: "/#pricing" },
  { key: "faq", href: "/#faq" },
] as const;

export const dashboardNav = [
  {
    sectionKey: "workspace",
    items: [
      { labelKey: "dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { labelKey: "restaurantProfile", href: "/restaurant-profile", icon: "UserCircle" },
      { labelKey: "qrStudio", href: "/qr-studio", icon: "QrCode" },
      { labelKey: "menuBuilder", href: "/menu-builder", icon: "UtensilsCrossed" },
      { labelKey: "offers", href: "/offers", icon: "Percent" },
      { labelKey: "analytics", href: "/analytics", icon: "BarChart3" },
    ],
  },
  {
    sectionKey: "account",
    items: [
      { labelKey: "settings", href: "/settings", icon: "Settings" },
      { labelKey: "subscription", href: "/subscription", icon: "CreditCard" },
    ],
  },
] as const;
