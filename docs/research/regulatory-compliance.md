# Regulatory and Compliance Notes

Compliance considerations for CMT Fleet Transit when serving **school transport** and **passenger fleet** operators. This is research guidance, not legal advice — counsel should review before production launch in each target jurisdiction.

---

## Compliance Scope

| Domain | Why it applies | v1 relevance |
|--------|----------------|--------------|
| **Data privacy** | PII on children, guardians, drivers, GPS trails | High — core data model |
| **Child safety** | Minors as passengers; guardian access boundaries | High — school-bus anchor |
| **Photo proof** | Check-in images may show identifiable children | High — optional but sensitive feature |
| **Location tracking** | Continuous GPS during trips | Medium — disclose and minimize |
| **Messaging** | LINE / Telegram / FCM to guardians | Medium — consent and opt-out |
| **Record retention** | Attendance and audit logs | Medium — org-configurable policy |

---

## Data Privacy

### Categories of personal data processed

| Data type | Subjects | Purpose | Sensitivity |
|-----------|----------|---------|-------------|
| Name, contact, role | Users (all roles) | Auth, RBAC, notifications | Standard PII |
| Name, school, stop | Passengers (often minors) | Routing, check-in | **Child PII** |
| Guardian contact | Parents / caregivers | Tracking access, alerts | PII + linkage to child |
| GPS coordinates | Drivers, vehicles | Live map, check-in proof | Location data |
| Photos | Passengers (optional) | Attendance dispute evidence | **Special category risk** |
| OTP / check-in events | Passengers | Attendance verification | Child activity log |
| Audit logs | All users | Security, compliance | Operational metadata |

### Applicable frameworks (by region)

| Region | Framework | Key obligations for CMT Fleet Transit |
|--------|-----------|--------------------------------------|
| **EU / UK** | GDPR / UK GDPR | Lawful basis, DPA with schools, data minimization, DPIA for child data |
| **US** | FERPA (school records), state laws (COPPA under 13), CCPA/CPRA | School as controller in many cases; vendor as processor |
| **Southeast Asia** | PDPA (TH, SG, MY, etc.) — varies | Consent, cross-border transfer notices, local DPO rules |
| **General** | Contractual | Data Processing Agreement (DPA) with each org customer |

### Product controls for v1

| Control | Implementation |
|---------|----------------|
| **Data minimization** | Guardians see linked passengers only; no bulk export for Parent role |
| **Tenant isolation** | RLS per `organization_id` — see [differentiators](differentiators.md) |
| **Purpose limitation** | Collect GPS only during active trip window |
| **Access logging** | `audit_logs` on privileged reads and all mutations |
| **Encryption in transit** | HTTPS everywhere; WSS for realtime |
| **Encryption at rest** | Supabase / storage provider defaults; document in security checklist |
| **Right to erasure** | Admin-initiated passenger/user delete with retention policy exceptions |
| **Subprocessor list** | Vercel, Supabase, Firebase, Google Maps, LINE, Telegram — document in DPA appendix |

### Controller vs processor model

```
School or transport vendor (Customer)     CMT Fleet Transit (Vendor)
         │                                          │
         │  Determines purpose: student transport   │  Processes on instructions
         │  Owns relationship with guardians      │  Provides software + hosting
         └────────────── DPA ──────────────────────┘
```

For **school districts**, the district is often the **data controller**; the bus vendor and CMT Fleet Transit act as **processors**. Contracts must clarify who responds to guardian data requests.

---

## Child Safety

### Regulatory and contractual drivers

| Driver | Requirement shape |
|--------|-------------------|
| School board policies | Written attendance proof; incident reporting timelines |
| Parent expectations | Know who is on the bus and when |
| Local transport authority | Driver vetting (outside software scope — note in contracts) |
| Insurance | Documented check-in trail after incidents |

Software cannot replace background checks or physical safety procedures — position CMT Fleet Transit as **documentation and visibility**, not sole safety guarantee.

### Guardian access boundaries

| Rule | Rationale |
|------|-----------|
| Guardian linked only to explicit passenger records | Prevents browsing other children |
| No guardian access to full route roster | Minimize exposure of other minors' names |
| No public shareable tracking links without auth | Prevents stalking or social engineering |
| Staff read-only monitoring without unnecessary PII export | Least privilege |

### Minor account handling

| Approach | v1 recommendation |
|----------|-------------------|
| Passengers as records, not login users | **Yes** — children do not authenticate |
| Guardian holds login (phone / LINE) | **Yes** — Parent / Guardian role |
| Driver sees passenger list for assigned trip only | **Yes** — scoped by trip + role |
| Photos of minors | **Optional per org** — default off until policy signed |

### Incident response (operational)

| Event | System support |
|-------|----------------|
| Missed stop allegation | Check-in log + GPS at stop time |
| Wrong child boarded | OTP mismatch blocks check-in; photo if enabled |
| Emergency | Emergency notification template; audit trail |

Runbook items belong in deployment documentation; research note: schools will ask *"what happens when GPS is wrong?"* — answer with timestamped event log, not live guarantee.

---

## Photo Proof

### Why photos are sensitive

Check-in photos may capture:

- Identifiable images of minors
- Other passengers or bystanders in frame
- Home or street context in background

Treat photos as **high-sensitivity optional feature**, not default-on for all orgs.

### Technical controls

| Control | Detail |
|---------|--------|
| **Org setting** | `photo_proof_required`: boolean, default `false` for pilot |
| **Storage** | Supabase Storage private bucket; signed URLs with short TTL |
| **Metadata** | Timestamp, GPS, trip_id, passenger_id, driver_id stored with object |
| **Access** | Admin and linked Guardian only; Staff per org policy |
| **Retention** | Configurable days (e.g. 90 / 180 / 365); auto-delete job |
| **Format** | JPEG from driver camera; size cap to reduce storage and EXIF leakage |

### Process controls

| Control | Detail |
|---------|--------|
| **Consent** | Guardian enrollment flow includes photo policy acknowledgment |
| **Notice** | Driver UI states when photo is required |
| **Alternative** | OTP-only check-in when photos disabled |
| **Deletion** | Honor guardian erasure requests via org admin |

### Regulatory touchpoints

| Region | Consideration |
|--------|---------------|
| GDPR | Legitimate interest or consent for biometric-adjacent data; DPIA if photos mandatory |
| US state laws | Some states restrict student images without parent consent |
| SEA PDPA | Consent for collection; clear purpose in privacy notice |

**Recommendation:** Ship OTP check-in in v1; enable photo proof per org after DPA and school policy review.

---

## Location Tracking

### Minimization principles

| Principle | v1 behavior |
|-----------|-------------|
| Collect only during active trip | GPS stream starts at trip start, stops at trip end |
| Retain history for operations | Location points tied to `trip_id`; retention policy per org |
| Do not sell location data | Contractual prohibition in terms of service |
| Driver awareness | Clear "trip live" indicator on driver UI |

### Guardian-facing map

- Show vehicle position, not historical home addresses of other passengers
- ETA derived from route progress, not guardian device tracking

---

## Messaging Compliance

### LINE, Telegram, FCM

| Channel | Compliance note |
|---------|-----------------|
| **FCM** | Guardian opt-in via app install or web push permission |
| **LINE** | Official account terms; org owns LINE channel; message purpose disclosed |
| **Telegram** | Bot privacy policy; guardian starts bot or accepts link |
| **SMS** (if added later) | Opt-in, quiet hours, unsubscribe — regional telecom rules |

### Message content

- Templates only for automated events — reduces driver distraction and wording liability
- Emergency template separate from marketing; no ads in guardian messages

---

## Security Baselines (Compliance-Enabling)

Cross-reference for implementation stage:

| Baseline | Compliance link |
|----------|-----------------|
| RLS tenant isolation | Privacy — separation of org data |
| RBAC per role | Child safety — least privilege |
| Audit log | Demonstrate who accessed what after incidents |
| Rate limiting on public APIs | Prevent scraping of passenger data |
| CSP headers | XSS reduction on guardian pages |
| `scripts/check-secrets` | Prevent credential leaks in repo |
| `crypto.randomUUID()` for IDs | Non-guessable resource identifiers |

---

## Compliance Checklist for Pilot

Before onboarding first school or vendor:

- [ ] Privacy policy and terms of service drafted (vendor + guardian-facing summary)
- [ ] DPA template for org customers
- [ ] Subprocessor list published
- [ ] Guardian consent flow for tracking and notifications
- [ ] Photo proof default **off**; enablement requires org admin acknowledgment
- [ ] Data retention defaults documented; deletion procedure tested
- [ ] RLS two-tenant test passed
- [ ] Incident contact and breach notification process defined (72h GDPR guideline)
- [ ] Regional counsel review for target launch country

---

## Regional Priority Matrix

| Launch region | Priority regulations | Product emphasis |
|---------------|---------------------|------------------|
| **US school vendor** | FERPA awareness, state student privacy | Guardian auth, audit log, DPA |
| **EU / UK** | GDPR, DPIA for children | DPA, erasure, data minimization |
| **Thailand / SEA** | PDPA, LINE as primary channel | LINE integration, consent in Thai/English |
| **Corporate shuttle** | Employer data policies | Less child-specific; employee PII |

---

## Open Legal Questions (Resolve Before Scale)

1. Is check-in photo considered biometric or mere photograph under target state law?
2. Who answers guardian SAR (subject access request) — org or vendor?
3. Cross-border data residency — does Supabase region selection satisfy school contract?
4. Minimum driver age and employment data — in scope or explicitly out?
5. Insurance certificate requirements for vendors using attendance proof?

---

## Related Documents

- [Differentiators](differentiators.md) — RLS and notification architecture
- [Discovery assumptions](../discovery/assumptions-and-risks.md) — R9 child photo compliance risk
- [Competitor matrix](competitor-matrix.md) — attendance feature gaps
- [Pricing model](pricing-model.md) — compliance support as premium tier option
