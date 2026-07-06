# Architecture Decision Records

Log of significant architectural decisions for CMT Fleet Transit. Format based on [Michael Nygard's ADR template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [001](001-supabase-postgres-rls.md) | Use Supabase PostgreSQL with RLS for multi-tenancy | Accepted |
| [002](002-firebase-auth-with-line.md) | Use Firebase Phone Auth + LINE for identity | Accepted |
| [003](003-nextjs-vercel-monorepo.md) | Use Next.js on Vercel in a pnpm monorepo | Accepted |
| [004](004-clarke-wright-routing.md) | Use Clarke-Wright + 2-opt for route optimization | Accepted |
| [005](005-multi-channel-notifications.md) | Use FCM, LINE, and Telegram for notifications | Accepted |

## Template

New ADRs use the next sequential number:

```markdown
# ADR-NNN: Title

**Status:** Proposed | Accepted | Deprecated
**Date:** YYYY-MM-DD

## Context
## Decision
## Consequences
### Positive
### Negative
### Neutral
```

## Related

- [Tech stack](../tech-stack.md)
- [Integration map](../integration-map.md)
- [Approval](../approval.md)
