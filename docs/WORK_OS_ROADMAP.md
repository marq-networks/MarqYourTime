# Work OS Roadmap

This roadmap reports evidence, not aspirational completion. Phase 0 and cloud Track A were completed before this record.

## Phase status and acceptance gates

| Phase | Status | Acceptance gate / next safe outcome |
|---|---|---|
| 0. Audit | COMPLETE | Prior repository/product audit exists. |
| 1. Product Foundation | DECISION PACKET READY | Founder approves user surfaces, product boundary, canonical modules, and policy exclusions. |
| 2. Domain / Product Architecture | PROPOSED | Founder approves domain map and disputed ownership; entity glossary follows. |
| 3. Canonical UX & Screen Consolidation | INVENTORIED | Approve canonical routes/screens, then redirect and retire duplicates with route tests. |
| 4. Technical Architecture | PROPOSED | Approve target below; prove it with one vertical slice. |
| 5. Database / Security / RBAC | BLOCKED ON POLICY | Approve tenancy, identity, hierarchy, and permission semantics before production business migrations. |
| 6. Production Foundation | NOT STARTED | CI runs typecheck, lint, tests, build; env validation, accessibility/security baselines, and operational error reporting exist. |
| 7. Core Work Engine | BLOCKED | Phase 1/5 gates cleared; one project/task workflow persists securely end-to-end. |
| 8. People + Time + Reporting | BLOCKED | Identity/hierarchy/time policies approved and secured end-to-end. |
| 9. Advanced Modules | BLOCKED | Finance/communication/integration policy and earlier core dependencies approved. |
| 10. Hardening & Launch | BLOCKED | Threat/performance/accessibility/recovery testing and launch runbooks pass. |

## Phase 1 — product foundation packet

### VERIFIED FROM REPOSITORY
- The application is a broad multi-domain workforce operations prototype with employee, organization-admin, and platform-admin surfaces.
- Strongest repeated workflow spine: People supplies identity/capacity -> Work assigns deliverables -> Time records effort/absence -> Finance consumes approved monetary inputs -> Analytics reads across domains -> Security/Audit governs changes.
- Capabilities represented by screens/contracts include projects/tasks/milestones, people/departments/roles, time sessions/corrections/leave/fines, expenses/payroll/accounts/reporting, channels/messages, activity analytics, security controls, billing, tenant operations, and integrations.
- Runtime truth is not production truth: login and roles are browser-controlled; services are predominantly in-memory/mock; many screens use local/session storage or embedded data; Supabase has a client foundation but no domain queries.
- The breadth and repetition indicate multiple prototype generations, not proof that every represented feature belongs in the launch product.

### RECOMMENDATION
- Define the initial product as a tenant-scoped work operations core: People directory + Work execution + Time capture, with reporting and audit as supporting capabilities.
- Sequence Finance, rich Communication, advanced Analytics, and Platform Administration after the core tenancy/auth/RBAC foundation, except for minimum platform operations needed to onboard and support tenants.
- Treat payroll, fines, surveillance/productivity measurement, accounting logic, and automated financial decisions as separately gated modules due to policy/compliance risk.

### FOUNDER DECISION REQUIRED
See OQ-001 through OQ-005 in `WORK_OS_OPEN_QUESTIONS.md`.

## Phase 2 — canonical domain and dependency map

| Domain | Candidate disposition | Owns | Depends on |
|---|---|---|---|
| People | KEEP | worker profile, membership, department references | tenant identity/auth |
| Work | KEEP; MERGE parallel admin/work generations | project, task, milestone, assignment | People; optionally Time |
| Time | KEEP | time entries, sessions, leave requests | People; Work link optional |
| Finance | DECISION REQUIRED; MERGE three route families if retained | expenses/accounts/approved money events | People, Time, Work |
| Communication | DECISION REQUIRED | channels/messages | People; optional Work links |
| Analytics | KEEP as read-only projection | derived reports, no source records | all approved domains |
| Security & Compliance | KEEP cross-cutting | audit/policy/consent metadata | identity and all mutations |
| Platform | KEEP minimum tenant operations; advanced scope gated | organizations, plans, system operations | auth/tenancy |
| Integrations | LEGACY until connector scope approved | connection configuration | domain APIs, secrets server-side |

Shared entity candidates: Organization/Tenant, User/Auth Identity, Membership, Worker Profile, Department, Project, Task, Assignment, Time Entry, Leave Request, Money Event, Conversation, Audit Event. Names and relationships are proposals, not schema approval.

Dependency order: tenancy + identity -> People membership -> Work -> Time -> Finance -> Analytics. Audit spans every mutation; Communication and Integrations attach only through stable IDs.

## Phase 3 — route/screen matrix

`navRegistry.ts` currently registers 178 unique paths. Prefix totals are: admin 49, org 23, employee 22, finance 17, time 16, super 10, work 9, platform 8, analytics 7, people 4, communication 4, security 4, integrations 3, diagnostics 2. The manifest contains 95 path declarations but only 85 unique paths because shared Work items and two other paths are repeated across role groups.

| Route family | Current evidence | Candidate |
|---|---|---|
| `/work/*` | Dedicated v2 Work screens plus older `/admin/*` Work screens | KEEP `/work/*`; MERGE old generation after workflow comparison |
| `/people/*` | Four domain routes plus `/admin/*` equivalents/enhanced variants | KEEP domain routes; MERGE enhanced/legacy only after feature parity review |
| `/time/*` and `/employee/*` | Domain admin routes and employee personal routes | KEEP both scopes; normalize naming after policy approval |
| `/finance/*`, `/org/finance/*`, employee money | Three overlapping generations/surfaces | DECISION REQUIRED; no deletion |
| `/communication/*`, employee/admin communicate | Shared and role-specific generations | DECISION REQUIRED; no deletion |
| `/analytics`, `/security`, `/integrations` plus `/admin` aliases | Repeated admin aliases | Prefer domain routes; retain aliases until redirects and access tests exist |
| `/super/*` and `/platform/*` | Platform-admin and org/platform settings overlap | MERGE only after tenancy responsibility is approved |
| `/diagnostics/*` | Development diagnostics registered at runtime | LEGACY; exclude from production navigation/build exposure after verification |

## Phases 4–10 — execution slices
1. Production harness: TypeScript config/typecheck, lint, unit/component smoke tests, and CI build.
2. Auth/tenancy proof: Supabase session, protected shell, organization selection, deny-by-default RLS test—after OQ-002/OQ-003.
3. People read slice: one tenant-scoped directory query with loading/error/empty states.
4. Work vertical slice: project/task lifecycle with audit events.
5. Time slice, then reporting projections; only then evaluate gated advanced modules.
6. Hardening: accessibility, threat model, performance budgets, backups/recovery, observability, incident and launch runbooks.
