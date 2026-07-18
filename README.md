# CMT Fleet Transit

Multi-tenant B2B SaaS for fleet and route management — real-time GPS tracking, route optimization, passenger check-in/out, and automated notifications.

Built for organizations that move people at scale: schools, corporate shuttles, tour operators, and transport services.

## What CMT Fleet Transit Does

CMT Fleet Transit gives transport operators a single control plane for daily fleet operations. Admins plan routes and assign trips; drivers execute runs with live GPS and verified check-ins; parents and guardians see where their passengers are without calling the office.

| Capability | Outcome |
|------------|---------|
| Route planning & optimization | Fewer miles, predictable pickup order, capacity-aware stops |
| Live tracking | Real-time vehicle position and ETA on dashboard and parent views |
| Check-in / check-out | OTP + photo proof tied to GPS coordinates |
| Notifications | Pickup, dropoff, delay, and emergency alerts via Telegram, LINE, and FCM |
| Multi-tenant isolation | Each organization owns its data; roles enforce least privilege |

## Who It Serves

| Role | Primary need |
|------|----------------|
| SuperAdmin | Platform-wide oversight across organizations |
| Admin | Org setup, fleet, routes, users, and reporting |
| Staff | Day-of monitoring without full edit access |
| Driver | Trip execution, GPS broadcast, passenger verification |
| Parent / Guardian | Visibility into pickup, dropoff, and delays |

## Discovery Documentation

Product discovery artifacts live under [`docs/discovery/`](docs/discovery/). They capture the problem space, personas, pain points, success criteria, assumptions, and the go / no-go decision before build work begins.

| Document | Description |
|----------|-------------|
| [Problem statement](docs/discovery/problem-statement.md) | Who hurts, what hurts, and why now |
| [Personas](docs/discovery/personas.md) | Role definitions and goals |
| [Pain points](docs/discovery/pain-points.md) | Operational gaps the product must close |
| [Success criteria](docs/discovery/success-criteria.md) | What "done" looks like for v1 |
| [Assumptions & risks](docs/discovery/assumptions-and-risks.md) | Hypotheses to validate early |
| [One-pager](docs/discovery/one-pager.md) | Problem → solution → user → value prop |

## Market Research

Competitive and positioning research lives under [`docs/research/`](docs/research/).

| Document | Description |
|----------|-------------|
| [Market landscape](docs/research/market-landscape.md) | Segments and competitor categories |
| [Competitor matrix](docs/research/competitor-matrix.md) | Features, pricing, tech, weaknesses |
| [Differentiators](docs/research/differentiators.md) | Product and technical advantages |
| [Regulatory compliance](docs/research/regulatory-compliance.md) | Privacy, child safety, photo proof |
| [Pricing model](docs/research/pricing-model.md) | B2B SaaS pricing sketches |
| [Positioning & priorities](docs/research/positioning-and-priorities.md) | Statement and feature priority list |

## Product Requirements

MVP scope and requirements live under [`docs/requirements/`](docs/requirements/).

| Document | Description |
|----------|-------------|
| [PRD](docs/requirements/prd.md) | Product Requirements Document |
| [User stories](docs/requirements/user-stories.md) | Stories per role |
| [MVP features](docs/requirements/mvp-features.md) | In-scope v1 feature set |
| [Out of scope](docs/requirements/out-of-scope.md) | Explicit v1 deferrals |
| [Non-functional requirements](docs/requirements/non-functional-requirements.md) | Performance, security, uptime |
| [MVP backlog](docs/requirements/mvp-backlog.md) | Epics and acceptance criteria |
| [Wireframes](docs/requirements/wireframes.md) | Low-fi key flow sketches |

## Architecture

System design documentation lives under [`docs/architecture/`](docs/architecture/).

| Document | Description |
|----------|-------------|
| [System overview](docs/architecture/system-overview.md) | Architecture diagram and flows |
| [Tech stack](docs/architecture/tech-stack.md) | Technology decisions by layer |
| [Monorepo structure](docs/architecture/monorepo-structure.md) | Apps and packages layout |
| [Integration map](docs/architecture/integration-map.md) | External service connections |
| [ADRs](docs/architecture/adr/) | Architecture Decision Records |
| [Approval](docs/architecture/approval.md) | Sign-off checklist |

## Database Design

Data layer documentation lives under [`docs/database/`](docs/database/). SQL migrations live in [`supabase/migrations/`](supabase/migrations/).

| Document | Description |
|----------|-------------|
| [ERD](docs/database/erd.md) | Entity-relationship diagram |
| [Schema](docs/database/schema.md) | Tables, columns, constraints |
| [RLS policies](docs/database/rls-policies.md) | Row-Level Security per role |
| [Indexes](docs/database/indexes.md) | Hot query indexes |
| [Migrations](docs/database/migrations.md) | Migration strategy |
| [Seed data](docs/database/seed-data.md) | Local development seeds |
| [DATABASE.md](docs/database/DATABASE.md) | Consolidated schema reference |

## Monorepo Foundation

Application workspace setup is tracked under [`docs/foundation/`](docs/foundation/). Source lives in `apps/` and `packages/` (see [monorepo structure](docs/architecture/monorepo-structure.md)).

| Item | Description |
|------|-------------|
| [Foundation index](docs/foundation/README.md) | Bootstrap order and exit criteria |
| [Tooling](docs/foundation/tooling.md) | TypeScript, ESLint, Prettier |
| [Env & secrets](docs/foundation/env-and-secrets.md) | `.env.example`, `pnpm check-secrets` |
| [SETUP.md](docs/foundation/SETUP.md) | Local quick start |
| Root workspace | `package.json`, `pnpm-workspace.yaml` |

## Authentication

Identity, sessions, and RBAC live under [`docs/auth/`](docs/auth/) and [`packages/auth`](packages/auth).

| Item | Description |
|------|-------------|
| [AUTH.md](docs/auth/AUTH.md) | Providers, claims, login flow, middleware, RBAC |
| Auth package | Firebase client/admin, LINE, role matrix |
| API routes | `/api/auth/{verify,session,line}` |

## Core APIs

Fleet operations CRUD and workflows under [`docs/api/`](docs/api/).

| Item | Description |
|------|-------------|
| [API.md](docs/api/API.md) | Endpoint contracts, RBAC, trip lifecycle |
| Route handlers | `apps/web/src/app/api/*` |

## Routing

Optimization and maps under [`docs/routing/`](docs/routing/) and [`packages/routing`](packages/routing).

| Item | Description |
|------|-------------|
| [ROUTING.md](docs/routing/ROUTING.md) | Clarke-Wright + 2-opt, distance matrix, optimize API |

## Dashboard

Operations admin UI under [`docs/dashboard/`](docs/dashboard/).

| Item | Description |
|------|-------------|
| [DASHBOARD.md](docs/dashboard/DASHBOARD.md) | Layout, pages, real-time monitoring, states |

## Field Operations

Driver app, tracking, and parent portal under [`docs/field/`](docs/field/).

| Item | Description |
|------|-------------|
| [FIELD.md](docs/field/FIELD.md) | Driver flow, offline queue, tracking, parent portal, PWA |

## Security & Quality

Notifications, testing, and hardening under [`docs/security/`](docs/security/).

| Item | Description |
|------|-------------|
| [SECURITY_CHECKLIST.md](docs/security/SECURITY_CHECKLIST.md) | Release security gates |
| [DEEP_SECURITY_AUDIT.md](docs/security/DEEP_SECURITY_AUDIT.md) | STRIDE threat model |

## Deployment

Shipping and operations under [`docs/deployment/`](docs/deployment/).

| Item | Description |
|------|-------------|
| [DEPLOYMENT_FREE_TIER.md](docs/deployment/DEPLOYMENT_FREE_TIER.md) | $0/month Vercel + Supabase + Firebase stack |
| [SETUP_INSTRUCTIONS.md](docs/deployment/SETUP_INSTRUCTIONS.md) | New-developer onboarding (< 30 min) |
| [RUNBOOK.md](docs/deployment/RUNBOOK.md) | Incidents, backup/restore, rollback, monitoring |

## Quick Start

```bash
corepack enable && corepack prepare pnpm@8.15.0 --activate
pnpm install
cp .env.example apps/web/.env.local   # fill Firebase / Supabase / Maps keys
supabase start && supabase db reset   # migrations + two-tenant seed
pnpm dev                              # http://localhost:3000
```

Quality gates: `pnpm type-check` · `pnpm lint` · `pnpm test` · `pnpm check-secrets`.

## Architecture at a Glance

```
apps/web ── Next.js 14 (dashboard · driver · parent · API routes)
   │
   ├─ @cmt/auth          Firebase + RBAC + LINE
   ├─ @cmt/storage       Supabase client + adapter
   ├─ @cmt/routing       Clarke-Wright + 2-opt optimizer
   ├─ @cmt/notifications Telegram · LINE · FCM
   └─ @cmt/shared        types · Zod · utils
        │
        ▼
   Supabase (Postgres + RLS + Realtime + Storage)
```

## Roadmap

| Stage | Status |
|-------|--------|
| Discovery, research, requirements, architecture | Complete |
| Database & multi-tenant model | Complete |
| Monorepo foundation | Complete |
| Auth, RBAC & sessions | Complete |
| Core domain APIs | Complete |
| Route optimization & maps | Complete |
| Operations dashboard | Complete |
| Driver app, tracking & parent portal | Complete |
| Notifications, testing & security | Complete |
| Deployment, monitoring & documentation | Complete |
| Post-v1: native apps, AI demand prediction, white-label, i18n | Planned |

## Status

**v1 complete.** All stages from discovery through deployment are implemented and documented. The stack is portfolio-ready and deployable to free tiers — see [DEPLOYMENT_FREE_TIER.md](docs/deployment/DEPLOYMENT_FREE_TIER.md).

## License

MIT — see [LICENSE](LICENSE). Contributions welcome: [CONTRIBUTING.md](CONTRIBUTING.md).
