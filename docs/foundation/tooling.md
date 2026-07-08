# Shared Tooling

TypeScript, ESLint, and Prettier conventions for the CMT Fleet Transit monorepo.

---

## TypeScript

| File | Role |
|------|------|
| [`tsconfig.json`](../../tsconfig.json) | Root base: `strict`, bundler resolution, `@cmt/*` path aliases |
| [`tsconfig.package.json`](../../tsconfig.package.json) | Workspace packages: `composite`, declarations — extend from each `packages/*/tsconfig.json` |

### Path aliases

| Alias | Package |
|-------|---------|
| `@cmt/shared` | `packages/shared/src` |
| `@cmt/auth` | `packages/auth/src` |
| `@cmt/storage` | `packages/storage/src` |
| `@cmt/routing` | `packages/routing/src` |
| `@cmt/notifications` | `packages/notifications/src` |

App-local aliases (e.g. `@/*` → `apps/web/src/*`) are defined in each app's `tsconfig.json`.

### Package `tsconfig.json` pattern

```json
{
  "extends": "../../tsconfig.package.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### App (`apps/web`) pattern

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Prettier

| File | Role |
|------|------|
| [`.prettierrc`](../../.prettierrc) | Semi, single quotes, print width 100 |
| [`.prettierignore`](../../.prettierignore) | Build artifacts, lockfile, generated PWA |

```bash
pnpm format              # write
pnpm exec prettier --check .
```

---

## ESLint

| File | Role |
|------|------|
| [`.eslintrc.cjs`](../../.eslintrc.cjs) | Shared rules for packages and scripts |
| [`.eslintignore`](../../.eslintignore) | Build outputs |

`apps/web` will also use `eslint-config-next` (added with the Next.js scaffold). Root config covers `packages/*`.

```bash
pnpm lint                # recursive (once packages define lint scripts)
```

Key rules: TypeScript recommended, Prettier compatibility, unused vars warn (allow `_` prefix), prefer type imports.

---

## Root scripts

| Script | Purpose |
|--------|---------|
| `pnpm format` | Prettier write across the repo |
| `pnpm lint` | `pnpm -r lint` |
| `pnpm type-check` | `pnpm -r type-check` |

---

## Related

- [Foundation index](README.md)
- [Monorepo structure](../architecture/monorepo-structure.md)
