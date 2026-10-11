export type PlanId = "free" | "starter" | "pro" | "business" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  price: number | null; // null = "Custom" (Enterprise)
  priceIdEnvVar?: string; // maps to a Stripe price ID at checkout time
  highlight?: boolean;
  features: string[];
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: ["1 menu, 20 items", "1 QR code", "Basic analytics"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 19,
    priceIdEnvVar: "STRIPE_PRICE_STARTER",
    features: ["Unlimited items", "3 QR styles", "Offers & coupons"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    priceIdEnvVar: "STRIPE_PRICE_PRO",
    highlight: true,
    features: ["Everything in Starter", "Full analytics suite", "3 branches"],
  },
  {
    id: "business",
    name: "Business",
    price: 99,
    priceIdEnvVar: "STRIPE_PRICE_BUSINESS",
    features: ["Unlimited branches", "Custom domain", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    features: ["Dedicated success manager", "SLA & SSO", "API access"],
  },
];
