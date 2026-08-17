# Work OS Decisions

Statuses: **APPROVED** means supported by an explicit repository/founder decision; **PROPOSED** is safe direction awaiting review; **SUPERSEDED** must not guide new work.

## Approved / established

| ID | Status | Decision | Evidence / consequence |
|---|---|---|---|
| D-001 | APPROVED | GitHub is source of truth; deploy the Vite SPA on Vercel and use the existing Supabase project. | Current cloud foundation and `vercel.json`; do not recreate or replace it. |
| D-002 | APPROVED | Use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the browser. | `.env.example` and `src/lib/supabase.ts`; service-role credentials are forbidden client-side. |
| D-003 | APPROVED | Preserve nine product domains: Work, People, Time, Finance, Communication, Analytics, Security & Compliance, Platform, Integrations. | `domainNavigation.ts`, navigation manifest, and constitution agree. |
| D-004 | APPROVED | Domain ownership baseline: People owns worker/org identity; Work owns projects/tasks; Time owns time/leave; Finance owns monetary records; Communication owns conversations; Analytics is read-only; Security/Audit is cross-cutting; Platform owns tenant/platform operations; Integrations owns connectors. | Repeated in `docs/WORKOS-CONSTITUTION.md` and `docs/CROSS-OS-DATA-SPINE.md`. Details involving payroll, fines, permissions, or hierarchy remain unapproved product policy. |
| D-005 | APPROVED | `navManifest.ts` is visible-navigation truth and `navRegistry.ts` is route-to-component truth. | Both modules declare this contract and `App.tsx` generates routes from the registry. |

## Proposed architecture (review before treating as product policy)

| ID | Status | Recommendation | Consequence |
|---|---|---|---|
| D-101 | PROPOSED | Adopt tenant-scoped Supabase Auth + Postgres + RLS behind typed domain repositories/services. | Screens depend on contracts rather than direct queries; every tenant table carries an organization key and deny-by-default RLS. |
| D-102 | PROPOSED | Keep three initial application surfaces: employee, organization administration, platform administration. | Matches implemented navigation. Do not infer the final Org Owner/Admin/Manager permission split. |
| D-103 | PROPOSED | Canonicalize domain URLs (`/work`, `/people`, etc.) over generation-based `/admin` aliases, using redirects during migration. | Removes route ambiguity without deleting screens; requires approval of the route matrix first. |
| D-104 | PROPOSED | Use one server-state/query boundary and schema validation at all I/O boundaries; keep ephemeral UI state local. | Exact libraries should be selected only when implementing the first production vertical slice. |

## Technical target

```text
React screens -> domain hooks/use-cases -> typed repository contracts
             -> Supabase browser client (Auth + RLS-protected data)
             -> server/Edge Function only for privileged or secret-bearing operations
Cross-cutting: error boundary, structured diagnostics, audit events, accessibility, CI
```

No production business schema is approved yet. Migrations must be forward-only, reviewed, and paired with RLS policies and policy tests. The frontend must never be the authorization boundary.
