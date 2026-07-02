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

## Status

Discovery and market research complete. Product requirements in progress — see [requirements](docs/requirements/).

## License

MIT
