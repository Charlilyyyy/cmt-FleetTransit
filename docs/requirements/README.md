# Product Requirements

Requirements documentation for CMT Fleet Transit v1: locking MVP scope so the build does not grow unbounded before architecture and implementation begin.

## Purpose

Market [research](../research/positioning-and-priorities.md) defined positioning and feature priorities. This folder translates them into buildable requirements:

1. **PRD** — product goals, scope boundary, and context
2. **User stories** — per role (SuperAdmin, Admin, Staff, Driver, Parent / Guardian)
3. **MVP feature set** — in-scope capabilities for v1
4. **Out of scope** — explicit deferrals
5. **Non-functional requirements** — performance, uptime, security, offline tolerance
6. **MVP backlog** — epics with acceptance criteria
7. **Wireframes** — low-fi sketches for key flows

## Documents

| File | Focus |
|------|-------|
| [prd.md](prd.md) | Product Requirements Document — goals, scope, references |
| [user-stories.md](user-stories.md) | Stories per role |
| [mvp-features.md](mvp-features.md) | In-scope feature set |
| [out-of-scope.md](out-of-scope.md) | v1 deferrals |
| [non-functional-requirements.md](non-functional-requirements.md) | NFRs |
| [mvp-backlog.md](mvp-backlog.md) | Epics + acceptance criteria |
| [wireframes.md](wireframes.md) | Low-fi flow sketches |

## Reading Order

Start with the PRD for context, then user stories and MVP features. Out-of-scope and NFRs bound the build. Finish with the backlog and wireframes for implementation handoff.

## Inputs

| Source | Link |
|--------|------|
| Discovery success criteria | [success-criteria.md](../discovery/success-criteria.md) |
| Feature priorities | [positioning-and-priorities.md](../research/positioning-and-priorities.md) |
| Compliance constraints | [regulatory-compliance.md](../research/regulatory-compliance.md) |
| Personas | [personas.md](../discovery/personas.md) |

## Outputs

When requirements are complete, the MVP backlog and wireframes feed **system architecture** and **database design** — repo structure and schema before feature code.

## v1 Anchor

All requirements trace to the **school-bus morning run** scenario: one organization, one school, optimized route, live trip, driver check-ins, guardian tracking and notifications, staff monitoring, admin reports.
