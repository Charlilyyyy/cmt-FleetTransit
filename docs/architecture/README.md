# System Architecture

Architecture documentation for CMT Fleet Transit: multi-tenant SaaS on a free-tier-friendly stack, defined before database design and application code.

## Purpose

Requirements are locked in [mvp-backlog](../requirements/mvp-backlog.md). This folder records **how** the system is built:

1. **System overview** — clients, API layer, data plane, external services
2. **Tech stack** — framework, database, auth, maps, hosting choices
3. **Monorepo structure** — `apps/` and `packages/` boundaries
4. **Integration map** — Firebase, Supabase, Google Maps, Telegram, LINE, FCM
5. **ADRs** — Architecture Decision Records for major choices
6. **Approval** — sign-off before implementation

## Documents

| File | Focus |
|------|-------|
| [system-overview.md](system-overview.md) | Architecture diagram and request flows |
| [tech-stack.md](tech-stack.md) | Layer-by-layer technology decisions |
| [monorepo-structure.md](monorepo-structure.md) | Repo layout and package boundaries |
| [integration-map.md](integration-map.md) | External services and data flows |
| [adr/](adr/) | Architecture Decision Records |
| [approval.md](approval.md) | Architecture sign-off checklist |

## Design Principles

| Principle | Implication |
|-----------|-------------|
| **Multi-tenant first** | `organization_id` + RLS on every tenant table |
| **Monorepo cohesion** | Shared types and validation in `packages/shared` |
| **Edge-friendly web** | Next.js on Vercel; API routes colocated with UI |
| **Realtime by default** | Supabase channels for GPS and trip status |
| **Pilot on free tier** | Stack choices must run at $0 for first org |
| **Phone-first field** | Drivers and guardians authenticate via mobile |

## Inputs

| Source | Link |
|--------|------|
| MVP backlog | [mvp-backlog.md](../requirements/mvp-backlog.md) |
| NFRs | [non-functional-requirements.md](../requirements/non-functional-requirements.md) |
| Differentiators | [differentiators.md](../research/differentiators.md) |

## Outputs

Approved architecture feeds **database design** (ERD, RLS, migrations) and **monorepo bootstrap** — repo structure exists before feature code.

## Target Stack (Summary)

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui |
| Database | Supabase (PostgreSQL + Realtime + Storage) |
| Auth | Firebase Phone Auth + custom claims / LINE login |
| Maps | Google Maps (Distance Matrix + Directions) |
| Hosting | Vercel (free tier) |
| Workspace | pnpm monorepo |
