# Contributing to CMT Fleet Transit

Thanks for helping build CMT Fleet Transit. This guide covers workflow and conventions.

## Workflow

1. Branch from `main`: `git checkout -b feat/<short-name>`.
2. Make focused commits with clear messages (imperative mood).
3. Run the quality gates before pushing (see [PRE_COMMIT_VERIFICATION.md](PRE_COMMIT_VERIFICATION.md)).
4. Open a PR; CI must be green.

## Monorepo layout

| Path | Contents |
|------|----------|
| `apps/web` | Next.js app (dashboard, driver, parent, APIs) |
| `packages/*` | `shared`, `storage`, `auth`, `routing`, `notifications` |
| `docs/*` | Per-area documentation |
| `supabase/` | Migrations + local seed |

## Conventions

- **TypeScript** everywhere; no implicit `any` in guards.
- **Validation** with Zod schemas from `@cmt/shared` on every API input.
- **Tenancy**: derive `organization_id` from the session, never the request body.
- **Audit**: every mutation calls `writeAudit`.
- **Naming**: use "CMT Fleet Transit" / `cmt-fleet-transit`.
- **Commits**: describe the *why*; keep each commit independently reviewable.

## Quality gates

```bash
pnpm type-check
pnpm lint
pnpm test
pnpm check-secrets
```

## Adding a package

1. Create `packages/<name>` with `package.json` (`@cmt/<name>`) and a `tsconfig.json` extending `tsconfig.package.json`.
2. Add it to `transpilePackages` in `apps/web/next.config.js` if imported by the app.
3. Export a clean barrel from `src/index.ts`.

## Reporting security issues

Do not open public issues for vulnerabilities. See [docs/security](docs/security/).
