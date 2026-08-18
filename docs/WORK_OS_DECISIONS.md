# Work OS Decisions

Statuses: **APPROVED** means supported by an explicit repository/founder decision; **PROPOSED** is safe direction awaiting review; **SUPERSEDED** must not guide new work.

## Approved / established

| ID | Status | Decision | Evidence / consequence |
|---|---|---|---|
| D-001 | APPROVED | GitHub is source of truth; deploy the Vite SPA on Vercel and use the existing Supabase project. | Current cloud foundation and `vercel.json`; do not recreate or replace it. |
| D-002 | APPROVED | Use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the browser. | `.env.example` and `src/lib/supabase.ts`; service-role credentials are forbidden client-side. |
| D-003 | APPROVED | Preserve nine product domains overall: Work, People, Time, Finance, Communication, Analytics, Security & Compliance, Platform, Integrations. | `domainNavigation.ts`, navigation manifest, and constitution agree. Not every domain is in the first production release. |
| D-004 | APPROVED | Domain ownership baseline: People owns worker/org identity; Work owns projects/tasks; Time owns time/leave; Finance owns monetary records; Communication owns conversations; Analytics is read-only; Security/Audit is cross-cutting; Platform owns tenant/platform operations; Integrations owns connectors. | Repeated in `docs/WORKOS-CONSTITUTION.md` and `docs/CROSS-OS-DATA-SPINE.md`. Details involving payroll, fines, permissions, or hierarchy remain separately gated. |
| D-005 | APPROVED | `navManifest.ts` is visible-navigation truth and `navRegistry.ts` is route-to-component truth. | Both modules declare this contract and `App.tsx` generates routes from the registry. |
| D-006 | APPROVED | First production release scope is People Directory + Work Execution + Time Capture + Essential Reporting + Audit. | Founder approval on 2026-08-18. Finance, advanced Communication/Analytics, payroll, fines, surveillance/productivity scoring, and similar sensitive/advanced modules are excluded from the first release unless separately approved later. |
| D-007 | APPROVED | A tenant may contain one or more organizations/workspaces; membership is explicit and production domain data must be scoped so organization/tenant access can be enforced server-side with RLS. | Founder approval on 2026-08-18. This is the tenancy basis for schema, invitations, organization switching, audit, and platform administration. |
| D-008 | APPROVED | Launch authorization starts with three backend-assigned roles: Employee, Org Admin, and Platform Admin. Owner and Manager are reserved until their distinct permissions are defined. | Founder approval on 2026-08-18. Browser role switching must never be an authorization boundary. |
| D-009 | APPROVED | First-release domain architecture is Platform/Tenancy -> People -> Work -> Time -> Reporting/Analytics, with Security & Audit cross-cutting. Core entities are Tenant, Organization/Workspace, User Identity, Membership, Worker Profile, Department, Project, Task, Milestone, Assignment, Time Entry, Work Session, and Audit Event; reporting is derived rather than a duplicate source of truth. | Founder approval on 2026-08-18. Finance and advanced Communication receive no first-release production schema. |

## Proposed architecture (review before treating as product policy)

| ID | Status | Recommendation | Consequence |
|---|---|---|---|
| D-101 | PROPOSED | Adopt Supabase Auth + Postgres + deny-by-default RLS behind typed domain repositories/services, implementing the approved tenant/organization model from D-007. | Screens depend on contracts rather than direct queries; tenant and organization boundaries must be represented explicitly where required. |
| D-102 | PROPOSED | Keep three initial application surfaces: employee, organization administration, platform administration. | This now aligns with approved launch roles in D-008; exact route/screen canonicalization remains Phase 3 work. |
| D-103 | PROPOSED | Canonicalize domain URLs (`/work`, `/people`, etc.) over generation-based `/admin` aliases, using redirects during migration. | Removes route ambiguity without deleting screens; requires Phase 3 approval of the route matrix first. |
| D-104 | PROPOSED | Use one server-state/query boundary and schema validation at all I/O boundaries; keep ephemeral UI state local. | Exact libraries should be selected only when implementing the first production vertical slice. |
| D-105 | PROPOSED | Approve the Phase 3 canonical role navigation and route matrix in `WORK_OS_PHASE_3_CANONICAL_UX.md`. | Visible launch navigation is limited to approved scope; legacy and deferred routes remain registered until approval, parity merges, redirects, and route tests. |

## Technical target

```text
React screens -> domain hooks/use-cases -> typed repository contracts
             -> Supabase browser client (Auth + RLS-protected data)
             -> server/Edge Function only for privileged or secret-bearing operations
Cross-cutting: error boundary, structured diagnostics, audit events, accessibility, CI
```

The product/domain decisions above are approved, but the production business schema itself is not yet implemented. Migrations must be forward-only, reviewed, and paired with RLS policies and policy tests. The frontend must never be the authorization boundary.
