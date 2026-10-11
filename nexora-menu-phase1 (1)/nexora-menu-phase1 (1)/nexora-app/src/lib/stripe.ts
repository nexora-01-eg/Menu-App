import Stripe from "stripe";

/**
 * Stripe SDK singleton. Subscription checkout, customer-portal, and
 * webhook handlers (Phase 2 — Billing) will import this.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-09-30.acacia",
  typescript: true,
});
