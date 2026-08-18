# Work OS Roadmap

This roadmap reports evidence, not aspirational completion. Phase 0 and cloud Track A were completed before this record.

## Phase status and acceptance gates

| Phase | Status | Acceptance gate / next safe outcome |
|---|---|---|
| 0. Audit | COMPLETE | Prior repository/product audit exists. |
| 1. Product Foundation | COMPLETE | Founder approved first-release scope, launch surfaces/roles, tenancy direction, and policy exclusions on 2026-08-18. |
| 2. Domain / Product Architecture | COMPLETE | Founder approved the core domain map, ownership boundaries, dependency order, and first-release entity model on 2026-08-18. |
| 3. Canonical UX & Screen Consolidation | CURRENT — INVENTORIED | Approve canonical routes/screens for the approved first-release scope, then redirect and retire duplicates with route tests. |
| 4. Technical Architecture | PROPOSED | Approve the target architecture and prove it with one vertical slice. |
| 5. Database / Security / RBAC | WAITING ON PHASES 3–4 | Approved tenancy and launch roles can now drive schema/RLS design once canonical surfaces and technical target are closed. |
| 6. Production Foundation | PARTIAL — EARLY WORK DONE | Quality harness and one bounded shared-contract slice exist; remaining acceptance work includes a green/managed quality baseline plus env validation, accessibility/security baselines, and operational error reporting. |
| 7. Core Work Engine | BLOCKED | Phases 3–6 gates cleared; one project/task workflow persists securely end-to-end. |
| 8. People + Time + Reporting | BLOCKED | Core identity/hierarchy/time implementation is secured end-to-end. |
| 9. Advanced Modules | BLOCKED | OQ-004/OQ-005 and other advanced-module policy decisions are approved after core dependencies. |
| 10. Hardening & Launch | BLOCKED | Threat/performance/accessibility/recovery testing and launch runbooks pass. |

## Phase 1 — Product Foundation — APPROVED

### Approved first-release product boundary
- People Directory
- Work Execution
- Time Capture
- Essential Reporting
- Audit

Deferred from the first release unless separately approved later: Finance, advanced Communication/Analytics, payroll, fines, surveillance/productivity scoring, and similar sensitive/advanced modules.

### Approved launch surfaces / roles
- Employee
- Org Admin
- Platform Admin

Owner and Manager remain reserved until their distinct permission semantics are defined. Browser role switching is prototype behavior and must not be treated as authorization.

### Approved tenancy direction
One tenant may contain one or more organizations/workspaces. Membership is explicit and production access must enforce tenant/organization boundaries server-side with RLS.

## Phase 2 — Domain / Product Architecture — APPROVED

### First-release domain dependency spine
Platform/Tenancy -> People -> Work -> Time -> Reporting/Analytics, with Security & Audit cross-cutting.

### Approved domain ownership
| Domain | First-release disposition | Owns / responsibility |
|---|---|---|
| Platform / Tenancy | KEEP minimum operations | tenants, organizations/workspaces, memberships, minimum customer administration |
| People | KEEP | worker profiles, organization membership references, departments |
| Work | KEEP | projects, tasks, milestones, assignments |
| Time | KEEP | time entries and work sessions; sensitive workforce logic remains gated |
| Reporting / Analytics | KEEP as read-only projection | derived reports; no duplicate source records |
| Security & Audit | KEEP cross-cutting | authorization enforcement support, audit events, policy metadata |
| Finance | DEFER first-release production schema | advanced-module decision later under OQ-005 |
| Communication | DEFER advanced production scope | advanced-module decision later |
| Integrations | DEFER | attach only after stable domain APIs/IDs exist |

### Approved first-release core entities
Tenant, Organization/Workspace, User Identity, Membership, Worker Profile, Department, Project, Task, Milestone, Assignment, Time Entry, Work Session, Audit Event.

Reporting is derived rather than a source of truth. Finance, payroll, fines, surveillance/productivity records, and advanced Communication entities are not part of the first-release production entity model.

## Phase 3 — route/screen matrix

`navRegistry.ts` currently registers 178 unique paths. Prefix totals are: admin 49, org 23, employee 22, finance 17, time 16, super 10, work 9, platform 8, analytics 7, people 4, communication 4, security 4, integrations 3, diagnostics 2. The manifest contains 95 path declarations but only 85 unique paths because shared Work items and two other paths are repeated across role groups.

| Route family | Current evidence | Candidate |
|---|---|---|
| `/work/*` | Dedicated v2 Work screens plus older `/admin/*` Work screens | KEEP `/work/*`; MERGE old generation after workflow comparison |
| `/people/*` | Four domain routes plus `/admin/*` equivalents/enhanced variants | KEEP domain routes; MERGE enhanced/legacy only after feature parity review |
| `/time/*` and `/employee/*` | Domain admin routes and employee personal routes | KEEP both scopes; normalize naming under the approved Employee/Org Admin surface model |
| `/finance/*`, `/org/finance/*`, employee money | Three overlapping generations/surfaces | OUT OF FIRST-RELEASE CANONICAL NAV; no destructive deletion until OQ-005 |
| `/communication/*`, employee/admin communicate | Shared and role-specific generations | ADVANCED/DEFERRED; no destructive deletion yet |
| `/analytics`, `/security`, `/integrations` plus `/admin` aliases | Repeated admin aliases | Keep essential reporting/audit routes; integrations deferred; retain aliases until redirects/access tests exist |
| `/super/*` and `/platform/*` | Platform-admin and org/platform settings overlap | Canonicalize minimum Platform Admin tenant operations under approved tenancy model |
| `/diagnostics/*` | Development diagnostics registered at runtime | LEGACY; exclude from production navigation/build exposure after verification |

## Phases 4–10 — execution slices
1. Phase 3: approve canonical first-release screens/routes and a safe redirect/retirement plan for duplicate prototype generations.
2. Phase 4: approve technical target and repository/service boundaries; prove the target with a bounded vertical-slice design.
3. Phase 5: implement Auth/tenancy/RBAC foundation: Supabase session, protected shell, organization selection, memberships, deny-by-default RLS and policy tests.
4. Complete remaining Phase 6 production-foundation acceptance work without reopening unrelated prototype cleanup.
5. Phase 7: Work vertical slice — project/task lifecycle with audit events.
6. Phase 8: People + Time + reporting production slices.
7. Resolve OQ-004/OQ-005 before sensitive workforce or Finance implementation; then evaluate Phase 9 advanced modules.
8. Phase 10 hardening: accessibility, threat model, performance budgets, backups/recovery, observability, incident and launch runbooks.
