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

export const marketingNav = [
  { label: "Product", href: "/#features" },
  { label: "Showcase", href: "/#showcase" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
] as const;

export const dashboardNav = [
  {
    section: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Restaurant Profile", href: "/restaurant-profile", icon: "UserCircle" },
      { label: "QR Studio", href: "/qr-studio", icon: "QrCode" },
      { label: "Menu Builder", href: "/menu-builder", icon: "UtensilsCrossed" },
      { label: "Offers", href: "/offers", icon: "Percent" },
      { label: "Analytics", href: "/analytics", icon: "BarChart3" },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Settings", href: "/settings", icon: "Settings" },
      { label: "Subscription", href: "/subscription", icon: "CreditCard" },
    ],
  },
] as const;
