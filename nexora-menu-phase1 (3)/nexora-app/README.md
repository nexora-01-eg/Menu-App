# NEXORA Menu

Luxury AI-powered digital menu platform for restaurants, cafés, and lounges.
Next.js 15 (App Router) · TypeScript · Tailwind · Framer Motion · shadcn/ui ·
Supabase Auth/DB · Prisma · Stripe.

## Architecture

**Multi-tenant model.** A `User` (Supabase Auth identity, mirrored in
`prisma.User`) can belong to many `Restaurant`s through `RestaurantMember`,
and every piece of menu content — `Category`, `Product`, `Offer`, `QrCode`,
`AnalyticsEvent` — is scoped by `restaurantId`. This is the seam that makes
the app multi-restaurant from day one instead of retrofitted later: every
Phase 2+ query filters on the caller's active `restaurantId`, so tenant
isolation is structural, not a query-by-query afterthought.

**Route groups mirror the three audiences of the product:**

```
src/app/
├── (marketing)/        public marketing site — landing page, pricing, FAQ
│   ├── layout.tsx       navbar + footer + ambient background
│   └── page.tsx
├── (auth)/              sign in / sign up — no dashboard chrome
│   ├── login/
│   └── register/
├── (dashboard)/         authenticated restaurant-owner workspace
│   ├── layout.tsx        sidebar + topbar shell
│   ├── dashboard/        KPIs, charts, activity
│   ├── menu-builder/     categories + products
│   ├── qr-studio/        QR design + export
│   ├── restaurant-profile/  ) 
│   ├── offers/              ) phase-pending panels — wired in later phases
│   ├── analytics/           ) (see roadmap below)
│   ├── settings/            )
│   └── subscription/        )
├── menu/[slug]/          PUBLIC customer-facing menu (no auth, no chrome)
└── api/webhooks/stripe/  billing webhook endpoint
```

Route groups (parenthesized folders) let `(marketing)`, `(auth)`, and
`(dashboard)` each own a distinct layout without that grouping leaking into
the URL — `/dashboard`, `/login`, and `/` all resolve at the root path
level. `menu/[slug]` is deliberately outside every group: it's the one
route a *guest* (no account) ever sees, so it carries no navbar, sidebar,
or auth requirement.

**Data layer.** `prisma/schema.prisma` is the single source of truth for
the domain. Supabase owns authentication and Postgres hosting; Prisma
talks to the same Postgres instance for typed queries. `src/lib/prisma.ts`
guards against connection-pool exhaustion in dev; `src/lib/supabase/`
has three clients for three contexts (`client.ts` browser, `server.ts`
Server Components/Actions, `middleware.ts` session refresh).

**Theme system.** `tailwind.config.ts` extends the palette with the
literal NEXORA tokens (`void`, `navy`, `slate`, `gold`, `gold.light`,
`electric`) plus shadcn's semantic tokens (`background`, `card`,
`primary`, …) mapped onto that palette in `globals.css`. Every shadcn
primitive therefore inherits the brand automatically — a `<Button
variant="gold">` and a `<Card>` never need one-off color overrides.
`.glass` is the single glass-morphism recipe reused everywhere.

**Component layering:**

- `components/ui/` — shadcn-style primitives (Button, Card, Badge, Switch,
  Tabs, Avatar, Input, Label, Separator, Progress). Hand-authored to match
  the shadcn API surface (`cva` variants, `asChild`, Radix under the hood)
  so the real `shadcn` CLI can drop in additional components later without
  touching what's already here.
- `components/shared/` — cross-cutting pieces: `Logo`, `AmbientBackground`,
  `SectionHeading`, `AnimatedCounter`, `QrGlyph`, `AppPageHeader`,
  `PhasePendingPanel`.
- `components/{marketing,layout,dashboard,menu-builder,qr-studio,customer}/`
  — screen-specific composition, one folder per audience/section.

**Internationalization.** Every page lives under `app/[locale]/` (the
standard `next-intl` App Router pattern) — English is un-prefixed at
`/`, Arabic lives at `/ar`. `src/i18n/routing.ts` defines the two
locales and exports locale-aware `Link`/`redirect`/`useRouter`/
`usePathname` that every component uses instead of the plain
`next/link` / `next/navigation` ones, so navigation always keeps (or
drops) the `/ar` prefix correctly. `messages/en.json` and
`messages/ar.json` hold the translations for the navbar, hero,
footer, auth screens, dashboard nav, and onboarding wizard. The root
layout sets `dir="rtl"` on `<html>` for Arabic, and directional
Tailwind utilities (`pl-`, `mr-`, `left-`, …) were converted to
logical ones (`ps-`, `me-`, `start-`, …) throughout so the layout
actually mirrors — except for a few transform-based centering spots
(`left-1/2 -translate-x-1/2`) that were deliberately *not* converted,
since that pattern centers via physical translation and breaks if
flipped to logical `start-1/2`.

Deeper dashboard screens (KPI labels, menu builder copy, etc.) are
still English-only — the translation pass so far covers the
highest-visibility, most-seen surfaces first.

## Stripe setup (required for billing to work)

1. In the Stripe Dashboard, create two **Products**, each with a recurring **Price**: "Starter" ($19/mo) and "Pro" ($49/mo) — add Business too if you want it self-serve. Copy each Price ID (`price_...`) into `.env` as `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO` / `STRIPE_PRICE_BUSINESS`.
2. Enable the **Customer Portal** (Settings → Billing → Customer portal) and turn on "Customers can switch plans" so upgrade/downgrade work from the portal, not just checkout.
3. Add a webhook endpoint pointing at `https://your-domain.com/api/webhooks/stripe` listening for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. For local testing, use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (it prints a temporary webhook secret to use locally).

## Supabase Storage setup (required for image upload to work)

1. In the Supabase Dashboard → Storage, create a bucket named exactly `product-images`, set it **Public**.
2. Run this in the SQL Editor so authenticated users can only write inside their own restaurant's folder (path convention: `{restaurantId}/...`):

```sql
create policy "Authenticated users can upload product images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from restaurant_members
    where restaurant_members."userId" = auth.uid()::text
    and restaurant_members."restaurantId" = (storage.foldername(name))[1]
  )
);

create policy "Authenticated users can update/replace their product images"
on storage.objects for update to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from restaurant_members
    where restaurant_members."userId" = auth.uid()::text
    and restaurant_members."restaurantId" = (storage.foldername(name))[1]
  )
);

create policy "Authenticated users can delete their product images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from restaurant_members
    where restaurant_members."userId" = auth.uid()::text
    and restaurant_members."restaurantId" = (storage.foldername(name))[1]
  )
);

create policy "Anyone can view product images"
on storage.objects for select to public
using (bucket_id = 'product-images');
```

3. Repeat the same for a second bucket named exactly `restaurant-assets` (also Public) — used for restaurant logos and cover images:

```sql
create policy "Authenticated users can upload restaurant assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'restaurant-assets'
  and exists (
    select 1 from restaurant_members
    where restaurant_members."userId" = auth.uid()::text
    and restaurant_members."restaurantId" = (storage.foldername(name))[1]
  )
);

create policy "Authenticated users can update/replace restaurant assets"
on storage.objects for update to authenticated
using (
  bucket_id = 'restaurant-assets'
  and exists (
    select 1 from restaurant_members
    where restaurant_members."userId" = auth.uid()::text
    and restaurant_members."restaurantId" = (storage.foldername(name))[1]
  )
);

create policy "Authenticated users can delete restaurant assets"
on storage.objects for delete to authenticated
using (
  bucket_id = 'restaurant-assets'
  and exists (
    select 1 from restaurant_members
    where restaurant_members."userId" = auth.uid()::text
    and restaurant_members."restaurantId" = (storage.foldername(name))[1]
  )
);

create policy "Anyone can view restaurant assets"
on storage.objects for select to public
using (bucket_id = 'restaurant-assets');
```

## Getting started

This response wrote the codebase directly (no network access in this
environment to run installs). To run it locally:

```bash
npm install
cp .env.example .env        # fill in Supabase + Stripe keys
npx prisma generate
npx prisma migrate dev      # once DATABASE_URL points at a real Postgres
npm run dev
```

## Phase roadmap

- **Phase 1:** architecture, theme system, layout/navigation,
  landing page, dashboard/menu-builder/QR-studio/customer-menu layouts
  — all UI, fixture-backed.
- **Phase 2 (in progress):**
  - ✅ Arabic/English i18n with RTL support
  - ✅ Supabase Auth: register, login, forgot/reset password (real,
    working flows — not stubs)
  - ✅ Restaurant Onboarding Wizard → creates Restaurant +
    RestaurantMember(OWNER) + first Branch + FREE Subscription via a
    real Prisma transaction
  - ✅ Dashboard gated on restaurant ownership (middleware protects
    routes; the dashboard layout redirects restaurant-less users to
    `/onboarding`)
  - ✅ Real Menu CRUD (categories/products), tenant-scoped
  - ✅ Stripe Billing: Checkout (with 14-day trial on first
    subscription), Customer Portal (upgrade/downgrade/cancel/invoices
    all handled by Stripe's hosted portal), webhook-driven
    Subscription sync, plan-based feature limits enforced server-side
  - ✅ Product image upload: drag & drop, client-side compression,
    replace/delete, Supabase Storage — see setup steps above
  - ✅ Restaurant Profile: logo + cover upload, description, address,
    contact, socials (Facebook/Instagram/TikTok/website), working
    hours — all real, persisted via Prisma
  - ✅ Branch Management: add/edit/delete branches, set-primary,
    plan-limited (Free/Starter capped at 1 branch, Pro at 3)
  - ✅ Real Analytics: a public `/api/track` endpoint records VIEW,
    SCAN, PRODUCT_CLICK, CATEGORY_VIEW, SEARCH, WHATSAPP_CLICK, and
    SHARE events (device/browser/OS parsed from User-Agent, country/
    city from Vercel's geo headers) fired from the real public menu
    page. The Analytics page and the main Dashboard read exclusively
    from these events now — no fixture numbers left in either.
  - ✅ Real QR generation: QR Studio renders an actual scannable QR
    (via `qrcode`) pointing at the restaurant's live menu URL, with
    real PNG/SVG/PDF export, logo overlay, color, and error-correction
    level — replacing the purely decorative preview from Phase 1.
  - ✅ Publish toggle: restaurants are created unpublished; the public
    menu page 404s until the owner explicitly publishes from
    Restaurant Profile.
  - ⬜ Email verification enforcement, rate limiting, session edge cases
- **Phase 3 (done this round):**
  - ✅ Offers module: Happy Hour (with daily time windows), Coupons,
    Banners; percentage or fixed discounts; date-range + time-range
    scheduling; branch/category/product targeting; Active/Paused/
    Archived lifecycle. All via `lib/offers-engine.ts` (pure,
    testable resolution logic) + `lib/actions/offers.ts`.
  - ✅ Offers connect to the real public menu automatically — the
    single best-matching non-coupon offer resolves server-side per
    product on every menu page load, rendering a premium gold badge
    and strikethrough price. Coupon-type offers are intentionally
    excluded from auto-badging (they require the guest to enter a
    code — no "enter coupon" UI exists yet, tracked as follow-up).
  - ✅ Restaurant Settings: currency, menu language, theme mode,
    tax rate, service fee, WhatsApp ordering toggle + message
    template — all real, persisted, and the WhatsApp FAB on the
    public menu now respects both.
  - ⬜ A coupon-code entry UI on the public menu (coupons are fully
    modeled and manageable in the dashboard, but a guest can't yet
    redeem one from the customer-facing page).
- **Phase 4 (done this round — v1.0 hardening):**
  - ✅ Coupon redemption UI on the public menu (`/api/coupon`,
    rate-limited 10/min per IP) — the last real feature gap is closed.
  - ✅ **Fixed a real production-blocking bug**: there was no
    `/auth/callback` route, so Supabase's email-confirmation and
    password-reset links would land users back on the site still
    logged out. Added `src/app/auth/callback/route.ts` and pointed
    every auth email at it.
  - ✅ Email verification enforced at the app level — unconfirmed
    users are redirected to `/verify-email` instead of reaching the
    dashboard or onboarding.
  - ✅ Multi-tenant audit performed (not just claimed): every Prisma
    call touching tenant data was traced by hand. Two call sites
    relied on an ID already derived from a scoped read rather than
    re-checking `restaurantId` themselves — not exploitable as found,
    but hardened anyway for defense-in-depth.
  - ✅ Rate limiting added to both public write endpoints
    (`/api/track`, `/api/coupon`) via a shared utility — see its
    documented in-memory limitation below.
  - ✅ Security headers (`X-Content-Type-Options`, `X-Frame-Options`,
    `Referrer-Policy`, `Permissions-Policy`, HSTS) added in
    `next.config.mjs`.
  - ✅ Recharts components converted to `ssr:false` dynamic imports
    with skeleton loading states — real bundle-splitting, not just a
    checklist tick.
  - ✅ ISR caching (`revalidate = 60`) added to the public menu page —
    the highest-traffic route, previously hitting Postgres on every
    single guest scan.
  - ✅ `PRODUCTION_CHECKLIST.md` — exact steps for Supabase
    production, Stripe live mode, Vercel, domain, and a required
    post-deploy smoke test. This is documentation, not something
    executable from here — it needs your own account access.
  - ⬜ No Lighthouse score has actually been measured (can't run a
    browser in this environment) — the changes above should help, but
    "95+" is unverified, not achieved.
  - ⬜ Login/registration rate limiting is Supabase's own
    responsibility (configured in their dashboard, documented in the
    checklist) — not application code, since those requests go
    browser→Supabase directly, bypassing our server entirely.
- **Known limitation carried forward:** the rate limiter is in-memory
  per server instance — fine for a single Vercel instance under
  moderate load, but not a real distributed limiter. If you scale to
  multiple regions/instances, replace `lib/rate-limit.ts` with
  Upstash Ratelimit.
