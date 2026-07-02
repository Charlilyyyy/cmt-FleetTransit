# Competitor Matrix

Side-by-side comparison of six representative competitors from [market landscape](market-landscape.md), plus CMT Fleet Transit as the target product. Scores reflect public positioning and typical SMB packages as of **June 2026** — validate before sales.

**Legend:** ✓ Full | ~ Partial / add-on | — Weak / absent | ? Varies by package

---

## Products Compared

| # | Product | Category | Primary buyer |
|---|---------|----------|---------------|
| 1 | Transfinder | School transport specialist | School district |
| 2 | BusWhere | School / vendor parent tracking | School or bus vendor |
| 3 | Samsara | Fleet telematics | Fleet / operations |
| 4 | Route4Me | Route optimization | SMB logistics / delivery |
| 5 | OptimoRoute | Route planning + driver app | SMB field service / transport |
| 6 | Here Comes the Bus | Parent tracking app | School district |
| — | **CMT Fleet Transit** | Unified passenger ops (target) | Transport vendor / school |

---

## Feature Matrix

| Feature | Transfinder | BusWhere | Samsara | Route4Me | OptimoRoute | Here Comes the Bus | CMT Fleet Transit |
|---------|:-----------:|:--------:|:-------:|:--------:|:-----------:|:------------------:|:-----------------:|
| Multi-stop route editor | ✓ | ~ | ~ | ✓ | ✓ | ~ | ✓ |
| Route optimization (VRP) | ✓ | — | — | ✓ | ✓ | — | ✓ |
| Capacity-aware routing | ✓ | — | — | ~ | ✓ | — | ✓ |
| Live GPS tracking | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ |
| Realtime dashboard | ✓ | ~ | ✓ | ~ | ~ | — | ✓ |
| Driver mobile app | ✓ | ~ | ✓ | ✓ | ✓ | — | ✓ (PWA) |
| Passenger check-in / OTP | ~ | ~ | — | — | ~ | — | ✓ |
| Photo proof at check-in | — | — | — | — | — | — | ✓ |
| Parent / guardian app | ~ | ✓ | — | — | — | ✓ | ✓ |
| Push notifications | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ✓ |
| LINE messaging | — | — | — | — | — | — | ✓ |
| Telegram messaging | — | — | — | — | — | — | ✓ |
| FCM / mobile push | ~ | ✓ | ✓ | ~ | ~ | ✓ | ✓ |
| Multi-tenant vendor SaaS | — | ~ | ✓ | ~ | ~ | — | ✓ |
| Row-level security (tenant) | ? | ? | ✓ | ? | ? | — | ✓ |
| Audit log | ~ | — | ✓ | — | — | — | ✓ |
| Attendance reports | ✓ | ~ | — | — | ~ | ~ | ✓ |
| Offline driver support | — | — | ~ | ~ | ~ | — | ✓ |
| API / integrations | ~ | ~ | ✓ | ✓ | ✓ | ~ | ~ (v1 markdown) |
| Free-tier deployable | — | — | — | ~ | — | — | ✓ |

### Feature gap highlights

| Gap in incumbents | CMT Fleet Transit response |
|-------------------|---------------------------|
| Telematics without passenger proof (Samsara) | OTP + photo check-in with GPS |
| Optimization without guardian layer (Route4Me, OptimoRoute) | Unified ops + parent portal |
| Parent apps without vendor multi-tenant ops (Here Comes the Bus, BusWhere) | Multi-org RLS for contractors serving many schools |
| School enterprise suites without regional messaging (Transfinder) | LINE + Telegram + FCM |
| No SMB zero-cost pilot path | Free-tier stack (Vercel, Supabase, Firebase) |

---

## Pricing Matrix

_Approximate entry positioning for SMB operators (5–20 vehicles). Enterprise quotes vary._

| Product | Pricing model | Typical SMB entry | Free tier | Contract |
|---------|---------------|-------------------|-----------|----------|
| **Transfinder** | Per district / module | $10k–50k+ / year | — | Annual, RFP-heavy |
| **BusWhere** | Per bus or district deal | $30–80 / bus / mo | — | 1–3 year school contracts |
| **Samsara** | Per vehicle + hardware | $30–50 / vehicle / mo + hardware | — | Annual |
| **Route4Me** | Per user / route tier | $40–200+ / mo | Limited trial | Monthly / annual |
| **OptimoRoute** | Per vehicle / driver | $35–45 / driver / mo | 7-day trial | Monthly / annual |
| **Here Comes the Bus** | District license | Bundled with district | — | District procurement |
| **CMT Fleet Transit** | Per org / vehicle / seat (TBD) | **$0 pilot** on free-tier infra | ✓ (self-hosted stack) | Monthly target |

### Pricing observations

| Pattern | Implication |
|---------|-------------|
| School products sold district-first | SMB **vendors** are underserved — multi-school contractors face per-district deals |
| Telematics bundles hardware | Higher friction for operators who only need phones + software |
| Optimization tools price per driver | Aligns with CMT Fleet Transit per-vehicle option |
| No incumbent offers true $0 software pilot | Free-tier deploy is a GTM wedge for first pilot org |

Detailed sketches: [pricing-model.md](pricing-model.md)

---

## Technology Matrix

| Product | Deployment | Mobile | Maps / routing | Realtime | Database model |
|---------|------------|--------|----------------|----------|----------------|
| **Transfinder** | Cloud / hosted | Native apps | Proprietary + GIS | Polling / push | District-centric |
| **BusWhere** | Cloud SaaS | Native parent app | GPS telematics partner | Push + map | School / vendor |
| **Samsara** | Cloud SaaS | Native driver app | Own + partners | High-frequency GPS | Org fleet |
| **Route4Me** | Cloud SaaS | Native driver app | Google / OSM | Periodic GPS | Account-based |
| **OptimoRoute** | Cloud SaaS | Native driver app | Google | Periodic GPS | Account-based |
| **Here Comes the Bus** | Cloud | Native parent app | GPS integration | Push notifications | District |
| **CMT Fleet Transit** | Vercel + Supabase | PWA (+ Capacitor optional) | Google Maps Matrix + Directions | Supabase Realtime | Multi-tenant Postgres + RLS |

### Tech stack comparison

| Dimension | Incumbent norm | CMT Fleet Transit choice | Trade-off |
|-----------|----------------|--------------------------|-----------|
| Auth | Vendor SSO / email | Firebase Phone + LINE | Regional LINE support; phone-first drivers |
| Data layer | Proprietary or mixed | Supabase Postgres | RLS for tenant isolation; dev velocity |
| Notifications | SMS + email + FCM | + LINE + Telegram | Regional fit; more integration surface |
| Optimization | Black-box or manual | Clarke-Wright + 2-opt (open logic) | Transparent, tunable; not ML-hyped |
| Hosting cost | Vendor-absorbed | Free-tier viable | Margin-friendly for bootstrap; quota monitoring required |

---

## Weaknesses by Competitor

### Transfinder

| Weakness | Opportunity for CMT Fleet Transit |
|----------|-----------------------------------|
| Enterprise sales cycle and price exclude small vendors | SMB self-serve pilot |
| District-first, not multi-vendor contractor platform | True multi-tenant SaaS for bus companies serving many schools |
| Legacy UX reputation in some markets | Modern Next.js + shadcn dashboard |
| Limited LINE / Telegram in typical US-centric stack | Regional messaging channels |

### BusWhere

| Weakness | Opportunity |
|----------|-------------|
| Parent-app centric; thin operator optimization | Full route planning + VRP |
| Pricing tied to hardware / telematics partnerships | Phone-only GPS via driver PWA |
| Weak multi-org vendor workflows | Contractor serves N schools from one admin |

### Samsara

| Weakness | Opportunity |
|----------|-------------|
| Built for assets and compliance, not passenger attendance | Check-in/out with OTP + photo |
| No guardian portal in core product | Parent tracking scoped by RLS |
| Hardware + per-vehicle cost | Software-only pilot on existing phones |
| Overkill feature set for 10-bus school vendor | Focused school-bus workflow |

### Route4Me

| Weakness | Opportunity |
|----------|-------------|
| Delivery / logistics positioning | Passenger transport personas and guardian comms |
| No school attendance or child-safety narrative | Attendance reports and audit trail |
| Guardian notifications not core | Event-driven pickup/dropoff alerts |
| Multi-tenant school vendor model absent | Org-per-contractor isolation |

### OptimoRoute

| Weakness | Opportunity |
|----------|-------------|
| Strong routing, weaker parent layer | Guardian map + notifications |
| Check-in is delivery-stop oriented, not child OTP | Passenger-specific verification |
| No LINE / Telegram | Regional channels |
| Limited realtime parent experience | Sub-100ms realtime target on Supabase |

### Here Comes the Bus

| Weakness | Opportunity |
|----------|-------------|
| District procurement only — vendors cannot resell | B2B vendor-led GTM |
| No route optimization for operators | Clarke-Wright capacity-aware routes |
| No driver check-in proof | Photo + GPS attendance |
| Single-district data model | Multi-tenant vendor platform |

---

## Pain Point Coverage (P1–P5)

How well each product addresses [discovery pains](../discovery/pain-points.md):

| Pain | Best incumbent | Gap |
|------|----------------|-----|
| **P1 Manual routing** | Route4Me, OptimoRoute, Transfinder | SMB vendors on spreadsheets still |
| **P2 No live tracking** | Samsara, BusWhere, HCTB | Telematics lacks guardian-scoped view |
| **P3 Poor parent comms** | HCTB, BusWhere | SMS-only; no LINE/Telegram |
| **P4 Attendance gaps** | Transfinder (partial) | Rarely OTP + photo + GPS together |
| **P5 Multi-vehicle coordination** | Samsara, Transfinder | Vendor multi-tenant weak |

**CMT Fleet Transit** is the only row targeting strong coverage on all five pains in a single SMB-accessible product.

---

## Competitive Position Summary

| Position | Leader | CMT Fleet Transit angle |
|----------|--------|-------------------------|
| Enterprise school suite | Transfinder | Avoid RFP; win vendors first |
| Parent map experience | Here Comes the Bus, BusWhere | Match map; add check-in proof |
| Fleet GPS breadth | Samsara | Don't compete on hardware; win on passenger workflow |
| Route optimization | Route4Me, OptimoRoute | Match optimization; add guardian + multi-tenant |
| SMB accessible SaaS | _(underserved)_ | Free-tier pilot + monthly pricing |

---

## Research Limitations

- Pricing is directional from public tiers and industry reports — request quotes for target geography
- Feature cells marked `~` often mean available in higher tier or via partner
- Some products rebrand or sunset modules; re-validate annually
- No hands-on pilot of each competitor in this document — matrix is secondary research

---

## Related Documents

- [Market landscape](market-landscape.md)
- [Differentiators](differentiators.md)
- [Pricing model](pricing-model.md)
- [Positioning & priorities](positioning-and-priorities.md)
