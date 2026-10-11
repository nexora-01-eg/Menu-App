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

- **Phase 1 (this drop):** architecture, theme system, layout/navigation,
  landing page, dashboard/menu-builder/QR-studio/customer-menu layouts —
  all UI, fixture-backed.
- **Phase 2:** Stripe billing (checkout, customer portal, webhook
  handlers) + wiring Supabase Auth end-to-end (session-aware sidebar,
  protected layouts already redirect via `middleware.ts`).
- **Phase 3:** Restaurant Profile & Branches CRUD.
- **Phase 4:** Offers & Promotions CRUD.
- **Phase 5:** Analytics Engine — aggregation queries over
  `AnalyticsEvent`, real charts.
- **Phase 6:** Account & Team management (`RestaurantMember` roles),
  Admin Panel.
