# Tech Stack

Technology decisions for CMT Fleet Transit v1. Each choice supports multi-tenant SaaS, free-tier pilot deployment, and the [MVP backlog](../requirements/mvp-backlog.md).

---

## Stack Summary

| Layer | Technology | Version target |
|-------|------------|----------------|
| **Language** | TypeScript | 5.3+ |
| **Frontend framework** | Next.js (App Router) | 14.x |
| **UI** | Tailwind CSS + shadcn/ui | Latest compatible |
| **Workspace** | pnpm workspaces | 8+ |
| **Database** | Supabase (PostgreSQL) | 15+ |
| **Realtime** | Supabase Realtime | Bundled |
| **File storage** | Supabase Storage | Bundled |
| **Auth** | Firebase Auth (Phone) + LINE | Firebase 10+ |
| **Maps** | Google Maps Platform | Distance Matrix + Directions + JS API |
| **Hosting** | Vercel | Free / Pro tier |
| **Notifications** | FCM, LINE Messaging API, Telegram Bot API | — |

---

## Frontend — Next.js 14 (App Router)

### Choice

Single `apps/web` Next.js application serving Admin dashboard, Staff views, Driver PWA routes, and Guardian portal.

### Rationale

| Factor | Why Next.js |
|--------|-------------|
| Full-stack in one repo | API routes colocated with UI — no separate backend deploy |
| App Router | Layouts per role (`/dashboard`, `/parent`, `/driver`) |
| Vercel native | Zero-config deploy; edge middleware for auth |
| React ecosystem | shadcn/ui components; large hiring pool |
| PWA support | Service worker + manifest for driver offline |

### Conventions

- Server Components for data-fetch pages where possible
- Client Components for maps, realtime, forms
- `middleware.ts` protects `/dashboard`, `/parent`, `/api`
- Environment: `NEXT_PUBLIC_*` only for non-secret config (e.g. Supabase anon key, Maps key)

### Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Separate Express API | Extra deploy, CORS, slower solo dev |
| Remix / SvelteKit | Team familiarity; Vercel integration depth |
| CRA / Vite SPA only | No SSR; weaker SEO for marketing landing |

---

## UI — Tailwind CSS + shadcn/ui

### Choice

Utility-first Tailwind with shadcn/ui copy-paste components (`Button`, `Table`, `Dialog`, `Select`, `Input`, `Skeleton`).

### Rationale

- Matches [wireframes](../requirements/wireframes.md) component notes
- Accessible defaults (Radix primitives)
- No heavy component library lock-in — source lives in repo
- Fast dashboard iteration

### Key UI modules

| Module | Components |
|--------|------------|
| Dashboard | `DashboardLayout`, sidebar nav, data tables |
| Maps | `GoogleMapsLoader`, `map-picker`, `LocationPicker` |
| Driver | Large `Button`, minimal chrome |
| States | `Skeleton`, error boundaries |

---

## Monorepo — pnpm Workspaces

### Choice

Root `pnpm-workspace.yaml` with `apps/*` and `packages/*`.

### Rationale

- Shared types between API and UI without publishing
- Single `pnpm install` for all packages
- `packages/routing` testable without Next.js
- Matches [differentiator D4](../research/differentiators.md) bootstrap story

### Root scripts (target)

```json
{
  "dev": "pnpm --filter web dev",
  "build": "pnpm -r build",
  "lint": "pnpm -r lint",
  "type-check": "pnpm -r type-check"
}
```

---

## Database — Supabase (PostgreSQL)

### Choice

Managed Postgres with Row-Level Security, Realtime, and Storage.

### Rationale

| Capability | Use in CMT Fleet Transit |
|------------|--------------------------|
| PostgreSQL | Relational fleet model; JSON for audit metadata |
| RLS | Multi-tenant isolation ([F01](../requirements/mvp-features.md)) |
| Realtime | GPS fanout < 100ms target |
| Storage | Check-in photos (private bucket) |
| Migrations | `supabase/migrations/*.sql` incremental |
| Free tier | Pilot at $0 |

### Client patterns

| Context | Client |
|---------|--------|
| Browser (anon + user JWT) | `packages/storage` browser client |
| API routes / Server Components | `supabase-server` with cookie session |
| Migrations | Supabase CLI `db push` |

### Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| PlanetScale / MySQL | Weaker RLS story; Realtime separate |
| Firebase Firestore | Complex multi-tenant queries; no SQL reports |
| Self-hosted Postgres | Ops burden for solo team |

---

## Auth — Firebase Phone + LINE

### Choice

Firebase Authentication for phone OTP; custom claims for `role` and `organization_id`. LINE Login for regional guardians and admins.

### Rationale

- Phone-first matches Driver and Guardian personas
- Firebase free tier generous for pilot
- Custom claims readable in middleware without extra DB round-trip
- LINE covers SEA market ([differentiator D2](../research/differentiators.md))

### Auth flows

| Flow | Provider |
|------|----------|
| Driver / Guardian phone | Firebase Phone Auth |
| Admin phone | Firebase Phone Auth |
| Admin / Guardian LINE | LINE OAuth → `/api/auth/line` → session |
| Session | HTTP-only cookie + Supabase user sync |

### Packages

`packages/auth`: `firebase-client`, `firebase-admin`, `line-auth`, `rbac`

### Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Supabase Auth only | LINE integration less mature for our flow |
| Auth0 | Cost at scale; overkill for pilot |
| Custom OTP | Security liability |

---

## Maps — Google Maps Platform

### Choice

Distance Matrix API + Directions API + Maps JavaScript API.

### Rationale

- Industry-standard distance accuracy ([assumption A7](../discovery/assumptions-and-risks.md))
- `packages/routing` LRU cache reduces cost
- Map picker UX for route editor
- $200 free credit for new GCP accounts

### Usage

| Feature | API |
|---------|-----|
| Route optimization | Distance Matrix (pairwise distances) |
| Driver / guardian map | Maps JavaScript API |
| Turn-by-turn (optional) | Directions API |

### Cost control

- LRU cache in `packages/routing/src/distance-cache.ts`
- Batch matrix requests per optimize call
- Monitor quota in GCP console

---

## Hosting — Vercel

### Choice

Vercel free tier for `apps/web`; preview deploys per PR.

### Rationale

- Native Next.js 14 support
- Edge middleware for auth
- Automatic HTTPS
- $0 pilot alignment

### Environment separation

| Branch | Vercel env | Supabase project |
|--------|------------|------------------|
| `main` | Production | Prod |
| `develop` | Preview / Staging | Staging |
| Local | — | Local or dev project |

---

## Notifications

### Choice

Multi-channel via `packages/notifications`:

| Channel | SDK / API |
|---------|-----------|
| FCM | Firebase Cloud Messaging |
| LINE | LINE Messaging API |
| Telegram | Telegram Bot API |

Unified `notification-service.ts` dispatches by org config and guardian preference.

---

## Supporting Tooling

| Tool | Purpose |
|------|---------|
| **ESLint** | Lint across monorepo |
| **Prettier** | Format consistency |
| **Zod** | Runtime validation (`packages/shared`) |
| **Supabase CLI** | Migrations, local dev |
| **TypeScript project references** | Package build order |

---

## Package Boundaries (Preview)

Detail in [monorepo-structure.md](monorepo-structure.md).

| Package | Responsibility |
|---------|----------------|
| `packages/shared` | Types, Zod schemas, constants, errors |
| `packages/auth` | Firebase, LINE, RBAC |
| `packages/storage` | Supabase client + adapter |
| `packages/routing` | VRP solver, distance calculator, cache |
| `packages/notifications` | Channel adapters + service |

**Rule:** `packages/*` must not import from `apps/*`.

---

## Version Pinning Strategy

| Scope | Policy |
|-------|--------|
| Next.js, React | Pin minor; test before major bump |
| Supabase JS client | Pin to compatible major with CLI |
| Firebase | Pin SDK major |
| shadcn/ui | Per-component copy; update individually |

Lockfile: `pnpm-lock.yaml` committed to repo.

---

## Environment Variables (Overview)

Full list in monorepo bootstrap (`.env.example`). Categories:

| Prefix | Examples |
|--------|----------|
| `NEXT_PUBLIC_` | Supabase URL, anon key, Maps key |
| Server only | `SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_ADMIN_*`, LINE/Telegram secrets |
| Never commit | All secrets; `scripts/check-secrets.sh` enforced |

---

## NFR Alignment

| NFR | Stack support |
|-----|---------------|
| NFR-P01 | Node API on Vercel; routing package isolated for benchmarks |
| NFR-P02 | Supabase Realtime WebSocket |
| NFR-P03 | Async notification dispatch from API route |
| NFR-S02 | Postgres RLS |
| NFR-O01 | PWA + IndexedDB in driver client |
| NFR-M01 | pnpm monorepo + documented setup |

---

## Related Documents

- [System overview](system-overview.md)
- [Monorepo structure](monorepo-structure.md)
- [Integration map](integration-map.md)
- [ADRs](adr/)
