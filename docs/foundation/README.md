# Monorepo Foundation & Dev Environment

Bootstrap for CMT Fleet Transit application code: pnpm workspace, shared tooling, Next.js app, and package stubs so later features plug into a known layout.

## Purpose

Database design is complete ([DATABASE.md](../database/DATABASE.md)). This folder tracks **how developers run and extend the repo**:

1. **Root workspace** — `pnpm-workspace.yaml`, root `package.json`
2. **Tooling** — TypeScript, ESLint, Prettier bases
3. **`apps/web`** — Next.js 14 scaffold
4. **`packages/shared`** — types, Zod, constants, errors
5. **`packages/storage`** — Supabase client + adapter stubs
6. **Secrets hygiene** — `.env.example`, `scripts/check-secrets.sh`
7. **SETUP.md** — local quick start

## Documents

| File | Focus |
|------|-------|
| [tooling.md](tooling.md) | TypeScript, ESLint, Prettier conventions |
| [env-and-secrets.md](env-and-secrets.md) | `.env.example`, `check-secrets` |
| [SETUP.md](SETUP.md) | Local install, env, `pnpm dev` |

Package and app source live under `apps/` and `packages/` (see [monorepo structure](../architecture/monorepo-structure.md)).

## Target Layout

```
cmt-fleetTransit/
├── apps/
│   └── web/                 # Next.js 14 primary app (scaffolded)
├── packages/
│   ├── shared/              # Types, Zod, constants (scaffolded)
│   └── storage/             # Supabase adapters (scaffolded)
├── scripts/                 # check-secrets.sh / .ps1
├── supabase/                # Already present
├── package.json
├── pnpm-workspace.yaml
└── .env.example             # Present
```

## Apps

| App | Status | Notes |
|-----|--------|-------|
| `apps/web` | Scaffolded | Landing, `/api/health`, auth/dashboard placeholders |
| `@cmt/shared` | Scaffolded | Types, Zod schemas, validation, errors — org-rooted model |
| `@cmt/storage` | Scaffolded | Supabase clients, `StorageAdapter`, org-scoped CRUD stubs |
## Workspace Scripts (Root)

| Script | Command |
|--------|---------|
| `pnpm dev` | Start `apps/web` on localhost:3000 |
| `pnpm build` | Build web app |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | TypeScript across workspace |
| `pnpm format` | Prettier write |
| `pnpm check-secrets` | Pre-push secret scan |

**Package manager:** `pnpm@8.15+`  
**Node:** `>=18` (`.nvmrc` pins 20)

## Reading Order

1. This README (workspace overview)
2. [Monorepo structure](../architecture/monorepo-structure.md) — boundaries and dependency rules
3. [SETUP.md](SETUP.md) — install and run
4. [Tech stack](../architecture/tech-stack.md) — version targets

## Inputs

| Source | Link |
|--------|------|
| Architecture approval | [approval.md](../architecture/approval.md) |
| Monorepo structure | [monorepo-structure.md](../architecture/monorepo-structure.md) |
| Tech stack | [tech-stack.md](../architecture/tech-stack.md) |
| Database | [DATABASE.md](../database/DATABASE.md) |

## Outputs

| Output | Location |
|--------|----------|
| Root workspace | `package.json`, `pnpm-workspace.yaml` |
| Web app | `apps/web/` |
| Shared packages | `packages/shared/`, `packages/storage/` |
| Env template | `.env.example` |
| Setup guide | [SETUP.md](SETUP.md) |

## Exit Criteria

- [x] `pnpm install` && `pnpm dev` runs web on localhost:3000
- [x] Type-check and lint pass on scaffold
- [x] [SETUP.md](SETUP.md) documents local quick start

## Related

- [Monorepo structure](../architecture/monorepo-structure.md)
- [Database design](../database/README.md)
- [SETUP.md](SETUP.md)
