# Monorepo Structure

Repository layout and package boundaries for CMT Fleet Transit. Defines where code lives **before** implementation begins — exit criterion for architecture approval.

---

## Repository Tree (Target)

```
cmt-fleetTransit/
├── apps/
│   ├── web/                          # Next.js 14 — primary application
│   │   ├── public/
│   │   │   ├── manifest.json         # PWA manifest
│   │   │   ├── sw.js                 # Service worker
│   │   │   └── offline.html
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx          # Marketing / redirect
│   │   │   │   ├── globals.css
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── dashboard/        # Admin + Staff
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx      # Live overview
│   │   │   │   │   ├── schools/
│   │   │   │   │   ├── vehicles/
│   │   │   │   │   ├── drivers/
│   │   │   │   │   ├── passengers/
│   │   │   │   │   ├── routes/
│   │   │   │   │   ├── trips/
│   │   │   │   │   ├── users/
│   │   │   │   │   ├── reports/
│   │   │   │   │   ├── settings/
│   │   │   │   │   └── audit/
│   │   │   │   ├── parent/           # Guardian portal
│   │   │   │   │   ├── tracking/
│   │   │   │   │   └── history/
│   │   │   │   ├── driver/           # Driver PWA routes (in web)
│   │   │   │   │   └── trip/[id]/
│   │   │   │   └── api/
│   │   │   │       ├── auth/
│   │   │   │       │   ├── email/
│   │   │   │       ├── line/
│   │   │   │       ├── session/
│   │   │   │       └── verify/
│   │   │   │       └── routes/
│   │   │   │           └── optimize/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   └── DashboardLayout.tsx
│   │   │   │   ├── ui/               # shadcn components
│   │   │   │   ├── GoogleMapsLoader.tsx
│   │   │   │   └── LocationPicker.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── lib/
│   │   │   │   ├── supabase.ts
│   │   │   │   ├── supabase-server.ts
│   │   │   │   └── session.ts
│   │   │   └── middleware.ts
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── driver/                         # Capacitor shell (P2) + shared hooks
│       ├── src/
│       │   ├── app/trip/[id]/
│       │   └── hooks/
│       │       ├── useGeolocation.ts
│       │       ├── useCamera.ts
│       │       └── useOfflineQueue.ts
│       ├── capacitor.config.ts
│       └── package.json
│
├── packages/
│   ├── shared/
│   │   └── src/
│   │       ├── types/
│   │       ├── schemas/              # Zod
│   │       ├── validation/
│   │       ├── constants/
│   │       ├── utils/
│   │       │   └── errors.ts
│   │       └── index.ts
│   ├── auth/
│   │   └── src/
│   │       ├── firebase-client.ts
│   │       ├── firebase-admin.ts
│   │       ├── line-auth.ts
│   │       ├── rbac.ts
│   │       └── index.ts
│   ├── storage/
│   │   └── src/
│   │       ├── adapter.ts
│   │       ├── supabase-adapter.ts
│   │       ├── supabase-client.ts
│   │       └── index.ts
│   ├── routing/
│   │   └── src/
│   │       ├── distance-calculator.ts
│   │       ├── distance-cache.ts
│   │       ├── vrp-solver.ts
│   │       ├── route-optimizer.ts
│   │       └── index.ts
│   └── notifications/
│       └── src/
│           ├── fcm.ts
│           ├── line.ts
│           ├── telegram.ts
│           ├── notification-service.ts
│           └── index.ts
│
├── supabase/
│   ├── config.toml
│   └── migrations/                   # Incremental SQL
│
├── scripts/
│   ├── check-secrets.sh
│   ├── check-secrets.ps1
│   └── deploy.sh
│
├── docs/
│   ├── discovery/
│   ├── research/
│   ├── requirements/
│   └── architecture/
│
├── package.json                      # Root workspace
├── pnpm-workspace.yaml
├── tsconfig.json                     # Base TS config
├── .env.example
├── .gitignore
└── README.md
```

---

## Workspace Configuration

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Root `package.json` (target)

| Script | Command |
|--------|---------|
| `dev` | `pnpm --filter web dev` |
| `dev:driver` | `pnpm --filter driver dev` |
| `build` | `pnpm --filter web build` |
| `lint` | `pnpm -r lint` |
| `type-check` | `pnpm -r type-check` |
| `format` | Prettier write |

**Package name (root):** `cmt-fleet-transit`  
**Node:** `>=18`  
**Package manager:** `pnpm@8.15+`

---

## App Boundaries

### `apps/web` — Primary application

| Responsibility | Include |
|----------------|---------|
| All user-facing UI | Dashboard, parent, driver routes |
| API routes | `/api/*` orchestration |
| Middleware | Auth + RBAC |
| PWA assets | `sw.js`, manifest |

| Do not include | Move to |
|----------------|---------|
| VRP algorithm | `packages/routing` |
| Firebase admin init | `packages/auth` |
| Zod schemas | `packages/shared` |
| Telegram API calls | `packages/notifications` |

**Depends on:** all `packages/*`

### `apps/driver` — Native wrapper (P2)

| Responsibility | Include |
|----------------|---------|
| Capacitor config | iOS/Android shell |
| Field hooks | geolocation, camera, offline queue |
| Thin trip page | May mirror `apps/web` driver routes |

**v1 note:** Driver UX ships in `apps/web` PWA first. `apps/driver` scaffold exists for Capacitor path without blocking MVP.

**Depends on:** `packages/shared`, optionally re-exports hooks used by web

---

## Package Boundaries

### `packages/shared`

**Purpose:** Types and validation shared across apps and packages.

| Export | Contents |
|--------|----------|
| `types` | `Organization`, `Trip`, `Passenger`, `Role`, etc. |
| `schemas` | Zod request/response schemas |
| `constants` | Role names, trip statuses, notification types |
| `utils/errors` | `AppError`, safe client error mapping |

**Depends on:** nothing internal  
**Depended by:** all packages and apps

---

### `packages/auth`

**Purpose:** Identity providers and RBAC helpers.

| Export | Contents |
|--------|----------|
| `firebase-client` | Browser Firebase init |
| `firebase-admin` | Server verify token, set claims |
| `line-auth` | LINE OAuth token exchange |
| `rbac` | `can(user, action, resource)` helpers |

**Depends on:** `shared`  
**Depended by:** `apps/web`, API routes

---

### `packages/storage`

**Purpose:** Supabase client factory and adapter pattern.

| Export | Contents |
|--------|----------|
| `supabase-client` | Browser client with anon key |
| `supabase-adapter` | CRUD adapters per entity |
| `adapter` | Interface for test mocks |

**Depends on:** `shared`  
**Depended by:** `apps/web`, optionally `notifications` for user lookup

---

### `packages/routing`

**Purpose:** Route optimization domain logic — no React.

| Export | Contents |
|--------|----------|
| `distance-calculator` | Google Maps Matrix client |
| `distance-cache` | LRU cache |
| `vrp-solver` | Clarke-Wright + 2-opt |
| `route-optimizer` | High-level optimize API |

**Depends on:** `shared`  
**Depended by:** `apps/web` `/api/routes/optimize`

**Testable:** Unit tests without Next.js runtime

---

### `packages/notifications`

**Purpose:** Multi-channel message dispatch.

| Export | Contents |
|--------|----------|
| `fcm`, `line`, `telegram` | Channel adapters |
| `notification-service` | Template render + dispatch |

**Depends on:** `shared`  
**Depended by:** `apps/web` API (check-in handler)

---

## Dependency Rules

```
                    ┌─────────────┐
                    │  apps/web   │
                    │ apps/driver │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌──────────┐    ┌────────────┐    ┌───────────────┐
   │   auth   │    │  routing   │    │ notifications │
   └────┬─────┘    └─────┬──────┘    └───────┬───────┘
        │                │                    │
        └────────────────┼────────────────────┘
                           ▼
                    ┌─────────────┐
                    │   shared    │
                    └─────────────┘
                           ▲
                    ┌──────┴──────┐
                    │   storage   │
                    └─────────────┘
```

| Rule | Description |
|------|-------------|
| **R1** | `packages/*` never import from `apps/*` |
| **R2** | `shared` has zero internal package deps |
| **R3** | No circular deps between packages |
| **R4** | Apps import packages via workspace protocol `"workspace:*"` |
| **R5** | Server-only code (firebase-admin) not bundled to client |

---

## TypeScript Configuration

| File | Scope |
|------|-------|
| Root `tsconfig.json` | Base: `strict`, paths aliases |
| `packages/*/tsconfig.json` | Extends base; `composite: true` |
| `apps/web/tsconfig.json` | Next.js plugin; path to packages |

### Path aliases (target)

```json
{
  "compilerOptions": {
    "paths": {
      "@cmt/shared": ["packages/shared/src"],
      "@cmt/auth": ["packages/auth/src"],
      "@cmt/storage": ["packages/storage/src"],
      "@cmt/routing": ["packages/routing/src"],
      "@cmt/notifications": ["packages/notifications/src"]
    }
  }
}
```

---

## API Route Ownership

All HTTP endpoints live in `apps/web/src/app/api/`:

| Route | Package used |
|-------|--------------|
| `/api/auth/*` | `auth`, `storage` |
| `/api/routes/optimize` | `routing`, `shared` |
| `/api/trips/*` (future) | `storage`, `shared` |
| Check-in handlers | `storage`, `notifications` |

API routes: validate → authorize → call package → map errors via `shared/utils/errors`

---

## Database & Migrations

| Path | Owner |
|------|-------|
| `supabase/migrations/*.sql` | Platform / backend |
| `supabase/config.toml` | Local Supabase CLI |

Migrations are **not** inside `packages/` — single source of truth for schema. Documented in upcoming database design doc.

---

## Static & PWA Assets

| File | Purpose |
|------|---------|
| `apps/web/public/manifest.json` | Installable PWA |
| `apps/web/public/sw.js` | Cache shell + offline fallback |
| `apps/web/public/offline.html` | Offline UX |

Driver offline queue logic: `apps/driver/src/hooks/useOfflineQueue.ts` (imported or duplicated in web driver routes for v1).

---

## Epic → Location Mapping

| Epic | Primary location |
|------|------------------|
| E1 Tenancy & auth | `packages/auth`, `middleware.ts`, `api/auth/*` |
| E2 Fleet entities | `dashboard/*/page.tsx`, `packages/storage` |
| E3 Routes | `dashboard/routes`, `packages/routing`, `api/routes/optimize` |
| E4 Trips & GPS | `dashboard/trips`, `driver/trip`, `locations` table |
| E5 Check-in | `driver/trip`, `packages/storage`, Storage bucket |
| E6 Live dashboard | `dashboard/page.tsx`, Realtime hooks |
| E7 Guardian | `parent/tracking`, `parent/history` |
| E8 Notifications | `packages/notifications`, org settings |
| E9 Reports | `dashboard/reports` |
| E10 Offline | `useOfflineQueue`, `sw.js` |
| E11 Security | `middleware.ts`, `shared/schemas`, `scripts/check-secrets.sh` |

---

## Bootstrap Order (Implementation)

When monorepo foundation epic runs:

1. Root `package.json`, `pnpm-workspace.yaml`, TS bases
2. `packages/shared` — types and Zod first
3. `packages/storage`, `packages/auth` — stubs
4. `apps/web` — Next.js scaffold, layout, health page
5. `packages/routing`, `packages/notifications` — as epics need them
6. `apps/driver` — minimal Capacitor scaffold
7. `supabase/migrations` — with database design epic
8. `.env.example`, `scripts/check-secrets.sh`

---

## Related Documents

- [Tech stack](tech-stack.md)
- [System overview](system-overview.md)
- [Integration map](integration-map.md)
- [MVP backlog](../requirements/mvp-backlog.md)
