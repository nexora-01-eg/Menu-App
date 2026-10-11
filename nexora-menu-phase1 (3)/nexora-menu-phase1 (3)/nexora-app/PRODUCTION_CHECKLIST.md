# NEXORA Menu — Production Deployment Checklist

This is the exact sequence to take the app from "runs on my laptop" to
"live and accepting real customers." Each step needs your own account
access, so none of this could be done automatically — follow it in
order.

---

## 1. Supabase — Production Project

1. Create a **new** Supabase project for production (don't reuse your
   dev project — you don't want test signups mixed with real
   customers).
2. **Settings → API** → copy the Project URL and anon key into your
   production environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. **Settings → Database** → copy the pooled connection string into
   `DATABASE_URL` and the direct connection string into `DIRECT_URL`.
4. **Authentication → URL Configuration**:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: add `https://yourdomain.com/auth/callback`
     (this is required — without it, email confirmation and password
     reset links will fail; see the code comment in
     `src/app/auth/callback/route.ts`)
5. **Authentication → Email**: confirm "Confirm email" is **ON**
   (it's on by default) — the app enforces this at the code level
   (`email_confirmed_at` check), but it needs to be on in Supabase too
   for the confirmation email to actually be required.
6. **Authentication → Rate Limits**: Supabase has built-in rate limits
   on auth endpoints (sign-up, sign-in, OTP). Review and tighten these
   in the dashboard — this is the correct place to rate-limit login/
   registration, not application code, since those requests go
   directly from the browser to Supabase's API.
7. Run migrations against this project:
   ```
   npx prisma migrate deploy
   ```
   (`migrate deploy`, not `migrate dev` — deploy applies existing
   migrations without prompting or generating new ones, which is what
   you want against a real database.)
8. Create the two Storage buckets (`product-images`,
   `restaurant-assets`) and run the RLS policy SQL — both are
   documented earlier in this README.

## 2. Stripe — Live Mode

1. In the Stripe Dashboard, toggle from **Test mode** to **Live mode**
   (top-right switch) — everything below must be redone in live mode;
   test-mode Price IDs will not work in production.
2. Re-create your Starter/Pro/Business Products and Prices in live
   mode. Copy the new live Price IDs into `STRIPE_PRICE_STARTER` /
   `STRIPE_PRICE_PRO` / `STRIPE_PRICE_BUSINESS`.
3. **Developers → API keys** (live mode) → copy the live secret key
   into `STRIPE_SECRET_KEY` and the live publishable key into
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. **Developers → Webhooks** → add an endpoint:
   `https://yourdomain.com/api/webhooks/stripe`, listening for
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_failed`. Copy the
   live signing secret into `STRIPE_WEBHOOK_SECRET`.
5. **Settings → Billing → Customer portal** → confirm it's activated
   in live mode too (this is a separate toggle from test mode).
6. Complete Stripe's business verification (bank account, tax info) —
   required before you can actually receive payouts, and can take a
   few days, so start this early.

## 3. Vercel — Deployment

1. Connect the GitHub repo to a new Vercel project.
2. Add every variable from `.env.example` into Vercel's Environment
   Variables (Production environment) — use the **live** Stripe keys
   and **production** Supabase keys from steps 1–2, not your local
   dev ones.
3. Set `NEXT_PUBLIC_APP_URL` to your real domain
   (`https://yourdomain.com`) — several places in the code (Stripe
   checkout success/cancel URLs, the sitemap, email redirect links)
   depend on this being correct.
4. Deploy. Vercel automatically provides HTTPS, which is required —
   Stripe webhooks and Supabase auth redirects will not work over
   plain HTTP.

## 4. Domain

1. In Vercel: **Project → Settings → Domains** → add your domain.
2. Follow Vercel's DNS instructions (either an A/CNAME record at your
   registrar, or delegate nameservers to Vercel).
3. Once verified, update `NEXT_PUBLIC_APP_URL` to match exactly
   (including `https://`, no trailing slash), and update the Supabase
   Site URL / Redirect URL (step 1.4) and Stripe webhook endpoint
   (step 2.4) to use the final domain if you changed it after initial
   setup.

## 5. Post-Deploy Smoke Test

Do this once, manually, end to end, before telling anyone the product
exists:

1. Register a brand-new account → confirm you receive the
   confirmation email → click it → land signed-in on `/dashboard`
   (this exact flow was broken before the `/auth/callback` route was
   added — verify it works).
2. Complete onboarding → create a restaurant.
3. Add a category, add a product with a photo.
4. Publish the menu from Restaurant Profile.
5. Open the public menu URL on your **phone**, not just desktop.
6. Generate a QR code in QR Studio, scan it with your phone's actual
   camera (not a QR reader app) — confirm it opens the live menu.
7. Create a Happy Hour offer, confirm the badge shows on the public
   menu.
8. Create a coupon, redeem it on the public menu.
9. Go to Subscription → upgrade to a paid plan → complete a real
   Stripe Checkout with a real card (Stripe won't let you fully test
   live mode with test cards) → confirm the webhook updates your plan
   in the dashboard within a few seconds.
10. Check Analytics — confirm the visits from steps 5–8 show up.

If any step in this list fails, that's a launch blocker — fix it
before accepting a paying customer.
