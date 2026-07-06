# ADR-003: Use Next.js on Vercel in a pnpm Monorepo

**Status:** Accepted  
**Date:** 2026-06-29

## Context

Solo/small team must ship Admin dashboard, Staff views, Driver PWA, Guardian portal, and API endpoints together. Deployment cost must stay $0 for first pilot. Shared types and domain logic (routing, notifications) should not be duplicated across apps.

Alternatives: separate React SPA + Express API, Remix, turborepo with multiple deployables, serverless functions only.

## Decision

- **Next.js 14 App Router** in `apps/web` — UI + API routes in one deployable
- **Vercel** hosting (free tier) with edge `middleware.ts` for auth
- **pnpm workspaces** with `apps/*` and `packages/*`
- Domain logic extracted to `packages/{shared,auth,storage,routing,notifications}`
- **`apps/driver`** as optional Capacitor shell (P2); driver UX primarily in `apps/web` PWA routes

Dependency rule: packages never import from apps ([monorepo-structure](../monorepo-structure.md)).

## Consequences

### Positive

- One `git push` deploys full stack; no CORS between SPA and API
- Server Components reduce client JS for dashboard lists
- Packages unit-testable without Next runtime (especially `routing`)
- Vercel preview URLs per PR for staging demos
- Matches team skill set and shadcn/ui ecosystem

### Negative

- Serverless cold starts may affect optimization API latency (mitigate: warm routes, cache)
- Next.js version upgrades require coordinated monorepo bump
- All API traffic shares Vercel function limits on free tier

### Neutral

- Marketing landing can live at `app/page.tsx` or separate site later
- `pnpm --filter web dev` is default local workflow
