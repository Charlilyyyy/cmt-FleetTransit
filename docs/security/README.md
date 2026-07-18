# Security & Quality

Notifications reliability, testing, and security hardening for CMT Fleet Transit.

| Document | Focus |
|----------|-------|
| [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) | Release security gates |
| [DEEP_SECURITY_AUDIT.md](DEEP_SECURITY_AUDIT.md) | STRIDE threat model + limitations |

## Notifications

| Area | Location |
|------|----------|
| Providers + service | [`packages/notifications`](../../packages/notifications) |
| Templates | pickup, dropoff, delay, emergency |
| Check-in trigger | `apps/web/src/lib/notify.ts` |

## Testing

| Suite | Location |
|-------|----------|
| Routing | `packages/routing/src/optimizer.test.ts` |
| Notifications | `packages/notifications/src/notification-service.test.ts` |
| Shared utils | `packages/shared/src/utils/index.test.ts` |

Run all: `pnpm test`.

## Exit Criteria

- [x] Guardian notified on check-in events (record + delivery path)
- [x] `pnpm type-check`, `pnpm lint`, `pnpm test` green
- [x] Security checklist complete

## Related

- [Field operations](../field/FIELD.md)
