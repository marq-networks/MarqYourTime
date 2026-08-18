# Work OS Roadmap

This roadmap reports evidence, not aspirational completion. Phase 0 and cloud Track A were completed before this record.

## Phase status and acceptance gates

| Phase | Status | Acceptance gate / next safe outcome |
|---|---|---|
| 0. Audit | COMPLETE | Prior repository/product audit exists. |
| 1. Product Foundation | COMPLETE | Founder approved first-release scope, launch surfaces/roles, tenancy direction, and policy exclusions on 2026-08-18. |
| 2. Domain / Product Architecture | COMPLETE | Founder approved the core domain map, ownership boundaries, dependency order, and first-release entity model on 2026-08-18. |
| 3. Canonical UX & Screen Consolidation | COMPLETE | Founder approved `WORK_OS_PHASE_3_CANONICAL_UX.md` on 2026-08-19; canonical role navigation, route matrix, merge safeguards, and redirect/retirement plan are locked. |
| 4. Technical Architecture | CURRENT — PROPOSED | Approve the target architecture, repository/service boundaries, data-flow/security rules, and bounded proof design. |
| 5. Database / Security / RBAC | WAITING ON PHASE 4 | Approved tenancy, roles and canonical surfaces can drive schema/RLS design once the technical target is closed. |
| 6. Production Foundation | PARTIAL — EARLY WORK DONE | Quality harness and one bounded shared-contract slice exist; remaining acceptance work includes a green/managed quality baseline plus env validation, accessibility/security baselines, and operational error reporting. |
| 7. Core Work Engine | BLOCKED | Phases 4–6 gates cleared; one project/task workflow persists securely end-to-end. |
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

### Phase 1 + 2 verification record (2026-08-18)
Repository reconciliation confirmed the approved three role identifiers and
the domain dependency/ownership baseline. Historical prototype documents have
been explicitly subordinated to the approved decisions. Deferred routes and
contracts remain present as prototype inventory, but are not launch scope;
their visible-navigation and route consolidation is governed by the approved Phase 3 plan.

## Phase 3 — Canonical UX & Screen Consolidation — APPROVED

Founder approved [`WORK_OS_PHASE_3_CANONICAL_UX.md`](WORK_OS_PHASE_3_CANONICAL_UX.md) on 2026-08-19.
The approved package locks:
- first-release role navigation for Employee, Org Admin and Platform Admin;
- canonical route/screen targets for People, Work, Time, Essential Reporting, Audit and minimum Platform/Tenancy operations;
- merge-before-retire safeguards for richer legacy People/Department/Work functionality;
- deferred route families outside launch navigation;
- a non-destructive redirect/retirement plan requiring parity and route tests before legacy retirement.

All 178 registered prototype routes remain source inventory until later approved migration work proves safe redirects/retirement. Approval of Phase 3 does not itself authorize destructive deletion.

## Phase 4 — Technical Architecture — CURRENT

Phase 4 must now verify and close the technical target before Phase 5 schema/Auth/RBAC implementation begins.
The existing proposed target is:

```text
React screens -> domain hooks/use-cases -> typed repository contracts
             -> Supabase browser client (Auth + RLS-protected data)
             -> server/Edge Function only for privileged or secret-bearing operations
Cross-cutting: error boundary, structured diagnostics, audit events, accessibility, CI
```

Phase 4 acceptance requires an approved technical boundary map, state/data-flow rules, error and validation boundaries, privileged-operation boundary, migration strategy from mock services, and a bounded vertical-slice proof design. Do not implement the Phase 5 production schema in Phase 4.

## Phases 4–10 — execution slices
1. Phase 4: approve technical target and repository/service boundaries; prove the target with a bounded vertical-slice design.
2. Phase 5: implement Auth/tenancy/RBAC foundation: Supabase session, protected shell, organization selection, memberships, deny-by-default RLS and policy tests.
3. Complete remaining Phase 6 production-foundation acceptance work without reopening unrelated prototype cleanup.
4. Phase 7: Work vertical slice — project/task lifecycle with audit events.
5. Phase 8: People + Time + reporting production slices.
6. Resolve OQ-004/OQ-005 before sensitive workforce or Finance implementation; then evaluate Phase 9 advanced modules.
7. Phase 10 hardening: accessibility, threat model, performance budgets, backups/recovery, observability, incident and launch runbooks.
