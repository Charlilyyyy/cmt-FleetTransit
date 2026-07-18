# Deployment, Monitoring & Documentation

Shipping CMT Fleet Transit to production and keeping it healthy.

| Document | Focus |
|----------|-------|
| [DEPLOYMENT_FREE_TIER.md](DEPLOYMENT_FREE_TIER.md) | $0/month stack + env separation |
| [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) | New-developer onboarding (< 30 min) |
| [RUNBOOK.md](RUNBOOK.md) | Incidents, backup/restore, rollback, monitoring |

## Tooling

| Item | Location |
|------|----------|
| Deploy script | `scripts/deploy.sh` |
| Vercel config | `vercel.json` |
| CI workflow | `.github/workflows/ci.yml` |

## Exit Criteria

- [x] Deploy path documented (Vercel + Supabase + Firebase)
- [x] New developer can clone → run in < 30 minutes
- [x] Runbook covers incidents, backup/restore, and rollback
- [x] README + docs cover every stage output

## Related

- [Security](../security/README.md)
- [Architecture](../architecture)
