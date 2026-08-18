# Work OS Phase 3 — Canonical UX decision packet

**Status:** PHASE 3 — DECISION PACKET READY  
**Prepared:** 2026-08-18  
**Constraint:** This packet proposes launch canonicals. No route, screen, or source
file has been deleted, redirected, or retired. Founder approval is required before
consolidation.

## Verdict

The repository has enough functional UI to define a coherent first-release
surface for all three approved roles. The domain-prefixed People, Work, Time,
Reporting, and Audit routes are the safest canonical generation. The visible
manifest now contains only those launch candidates; all 178 registered routes
remain reachable by direct URL for comparison and future migration.

## Recommended role navigation

| Role | First-release visible navigation |
|---|---|
| Employee | Work: My Work, Projects, Tasks, Milestones, Assignments, Work Reports; Time: Work Session, Time Entries; My Profile |
| Org Admin | Dashboard; People: Directory, Memberships & Invitations, Departments; Work: Projects, Tasks, Milestones, Assignments, Work Reports; Time: Time Entries, Work Sessions, Review & Corrections; Essential Reports; Audit Log; Organization Settings |
| Platform Admin | Support Console; Organizations; Global Audit |

Employee directory access is not proposed: the only directory implementation
contains organization-administration actions. Platform organization detail is
kept reachable from the Organizations screen but is not a separate top-level
navigation item.

## Canonical first-release matrix

Classification terms apply to routes/screens, not source deletion.

| Capability / role | Current routes and screen evidence | Alternatives / missing functionality | Recommendation |
|---|---|---|---|
| Own profile — Employee | `/employee/profile` → `E10Profile`; editable personal/contact/preferences and skills | No equivalent People-domain employee profile | **CANONICAL** |
| Directory and worker detail — Org Admin | `/people/employees` → `A03Users`; directory table and user view/actions | `/admin/users` is the same component; `/admin/users-enhanced` adds richer create/edit/delete/suspend flows absent from canonical | `/people/employees` **CANONICAL**; enhanced route **MERGE INTO CANONICAL — MERGE REQUIRED BEFORE RETIREMENT** for safe worker CRUD/status actions |
| Membership/invitations — Org Admin | `/people/members` → `A04Members`; invite, export, membership removal | `/admin/members` is the same component | **CANONICAL**; admin alias **LEGACY / REDIRECT LATER** |
| Departments — Org Admin | `/people/departments` → `A05Departments`; add/edit/export and service-backed department data | `/admin/departments` is the same component; `/admin/departments-enhanced` has delete and a richer editor | Domain route **CANONICAL**; enhanced route **MERGE INTO CANONICAL — MERGE REQUIRED BEFORE RETIREMENT** for delete/editor parity |
| Approved People administration | Canonical routes above | `/people/roles-access` and `/admin/roles-access` encode authorization policy not approved for Phase 3 | **DEFERRED FROM FIRST RELEASE**; revisit with Phase 5 RBAC |
| Work execution — Employee and Org Admin | `/work/my-work`, `/work/projects`, `/work/tasks`, `/work/milestones`, `/work/assignments` → `Work*OS`; shared v2 list/board/detail drawers, filters and mutations | `/admin/work-home`, projects, tasks, milestones, assignments are older generated administration screens; `/work/home` is a skeleton | Domain `Work*OS` routes **CANONICAL**. Older screens **MERGE INTO CANONICAL** only where parity review finds unique bulk/admin actions |
| Work reporting | `/work/reports` → `WorkReportsOS`; work-domain report projection | `/admin/work-reports` older screen; `/analytics/*` has broader prototypes | **CANONICAL** for Employee and Org Admin work reporting; old alias **LEGACY / REDIRECT LATER** |
| Work calendar / email | `/work/calendar`, `/work/email` and `/admin/calendar`, `/admin/email` | Calendar is useful but not required by locked capabilities; email is advanced Communication | **DEFERRED FROM FIRST RELEASE**; do not retire |
| Work Session — Employee | `/employee/my-day` and `/time/my-day` → `E02MyDay`; start/stop session and day state | Two aliases to the same screen | `/employee/my-day` **CANONICAL**; `/time/my-day` **LEGACY / REDIRECT LATER** |
| Time Entry — Employee | `/employee/time-logs` → `E04TimeLogs`; personal time entry/log surface | `/time/time-logs` is only a placeholder and mentions productivity metrics | Employee route **CANONICAL**; placeholder **LEGACY / REDIRECT LATER** after role-safe replacement |
| Time review — Org Admin | `/time/tracking` → `W04TimeLogs`; time table, filters, review/export | `/admin/time-logs` is same component; finance-posting action is outside launch scope | Domain route **CANONICAL**; hide/disable finance-posting during later UX merge; admin alias **LEGACY / REDIRECT LATER** |
| Work sessions — Org Admin | `/time/sessions` → `A07Sessions`; session list/refresh | `/admin/sessions` is same component | **CANONICAL**; alias **LEGACY / REDIRECT LATER** |
| Review/correction — Org Admin | `/time/corrections` → `A10Corrections`; review, approve/reject and correction workflow | `/admin/corrections` is same component | **CANONICAL**; alias **LEGACY / REDIRECT LATER** |
| Essential reporting — Org Admin | `/analytics/reports` → `A19Reports`; read-only report catalog/download/export representing People, Work and Time summaries | `/admin/reports` is same component; `/analytics/app-reports` is app/website activity only; advanced dashboards exceed launch scope | `/analytics/reports` **CANONICAL**; alias **LEGACY / REDIRECT LATER**; other analytics **DEFERRED** |
| Tenant audit — Org Admin | `/security/audit-logs` → `A22AuditLogs`; filter/refresh/export audit visibility | `/admin/audit-logs` is same component | **CANONICAL**; alias **LEGACY / REDIRECT LATER** |
| Organization operation — Org Admin | `/platform/org-settings` → `A30Settings`; minimum organization settings | `/admin/settings` is same component; `/platform/settings` is a skeleton | **CANONICAL**; aliases **LEGACY / REDIRECT LATER** |
| Tenant support — Platform Admin | `/super/console` → `S01Console`; support overview; `/super/organizations` → `S02Organizations`; tenant list/create and access to `/super/org-detail` → `S03OrgDetail` | `/platform/overview` aliases console. Org detail requires selection/navigation wiring validation before retirement work | Console and Organizations **CANONICAL**; Org Detail **CANONICAL contextual route**; overview **LEGACY / REDIRECT LATER** |
| Global audit — Platform Admin | `/super/audit-logs` → `S07GlobalAuditLogs`; global filtering/export | No competing global audit surface | **CANONICAL** |

## Merge-required safety list

1. Merge `A03UsersEnhanced` worker create/edit/delete/suspend functionality into
   the `/people/employees` canonical experience before retiring
   `/admin/users-enhanced`.
2. Merge `A05DepartmentsEnhanced` delete and richer editor behavior into the
   `/people/departments` experience before retiring
   `/admin/departments-enhanced`.
3. Compare old `/admin/projects`, `/admin/tasks`, `/admin/milestones`, and
   `/admin/assignments` bulk/admin actions against the Work OS drawers before
   redirecting them. Preserve any useful administration action; do not carry
   email, monitoring, Finance, or other deferred behavior into launch.
4. Remove the Finance-posting affordance from the eventual launch Time review
   UX, without discarding valid filtering/export behavior.
5. Essential reports need explicit People/Work/Time labels and read-only data
   contracts during implementation; the current prototype visually represents
   these reports but does not prove production data completeness.

## Deferred and non-production route inventory

These registered routes remain in source and direct-route inventory, but are
removed from first-release visible navigation.

| Classification | Routes / families |
|---|---|
| Finance, payroll, earnings and billing | `/finance/*`, `/org/finance/*`, `/employee/money/*`, `/employee/earnings`, `/admin/payroll`, `/admin/billing`, `/admin/billing-plans`, `/platform/finance-console`, `/platform/billing`, `/platform/billing-plans`, `/super/billing`, `/super/seat-sales` |
| Advanced Communication | `/communication/*`, `/employee/communicate*`, `/employee/team-hub`, `/admin/communicate*`, `/work/email`, `/admin/email` |
| Advanced analytics / surveillance | `/analytics/live-activity`, `/analytics/activity-overview`, `/analytics/input-counters`, `/analytics/screenshot-review`, `/analytics/app-reports`, `/analytics/analytics`, `/employee/my-activity`, `/employee/activity-overview`, `/employee/analytics`, `/admin/live-activity`, `/admin/activity-overview`, `/admin/app-reports`, `/admin/input-counters`, `/admin/screenshot-review`, `/admin/analytics` |
| Sensitive or unapproved Time policy | `/time/leave*`, `/time/fines*`, `/time/my-fines`, `/time/input-counters`, `/time/screenshot-review`, `/time/offline-sync`, `/time/workday-rules`, `/time/break-rules`, `/employee/leave`, `/employee/my-fines`, and matching `/admin/*` routes |
| Advanced security/configuration | `/security/consent-privacy`, `/security/data-retention`, `/security/security`, `/admin/consent`, `/admin/data-retention`, `/admin/security`, `/super/policies` |
| Advanced integrations/platform operations | `/integrations/*`, `/admin/integrations`, `/admin/api-docs*`, `/platform/platform-settings`, `/super/health`, `/super/admins`, `/super/calendar`, `/platform/calendar` |
| Peripheral prototype | `/employee/dashboard`, `/employee/calendar`, `/employee/notifications`, `/admin/notifications`, `/work/calendar`, `/admin/calendar`, `/admin/offline-sync`, `/admin/engine-console` |
| Development / diagnostic | `/diagnostics/ui-binding`, `/diagnostics/service-layer` — **DEVELOPMENT / DIAGNOSTIC** and never launch navigation |

## Redirect and retirement plan (not executed)

| Source route(s) | Target | Action after approval |
|---|---|---|
| `/employee/my-work` | `/work/my-work` | Keep temporarily as alias, then redirect after route tests |
| `/admin/users`, `/admin/members`, `/admin/departments` | matching `/people/*` route | Redirect after role and deep-link tests |
| `/admin/users-enhanced`, `/admin/departments-enhanced` | matching `/people/*` route | **Merge missing capability first**, then redirect |
| `/admin/projects`, `/admin/tasks`, `/admin/milestones`, `/admin/assignments` | matching `/work/*` route | Complete feature-parity review/merge, keep temporary aliases, then redirect |
| `/admin/work-home`, `/work/home` | `/work/my-work` for Employee; `/work/projects` for Org Admin | Role-aware redirect after route tests |
| `/admin/work-reports` | `/work/reports` | Redirect after report parity test |
| `/time/my-day` | `/employee/my-day` | Redirect after Employee deep-link test |
| `/admin/time-logs` | `/time/tracking` | Redirect after review/export parity test |
| `/admin/sessions` | `/time/sessions` | Redirect after route test |
| `/admin/corrections` | `/time/corrections` | Redirect after correction workflow test |
| `/admin/reports` | `/analytics/reports` | Redirect after report-link test |
| `/admin/audit-logs` | `/security/audit-logs` | Redirect after tenant-scope test |
| `/admin/settings`, `/platform/settings` | `/platform/org-settings` | Merge any useful setting first; redirect after settings route test |
| `/platform/overview` | `/super/console` | Keep temporarily as alias, then redirect |
| All deferred families above | None during Phase 3 | Remove from visible navigation; defer. Retire only after later product approval and route-usage proof |
| `/diagnostics/*` | None | Keep development-only now; remove from production route generation in a separately approved, tested change |

## Bounded debugging findings

- **Fixed:** visible navigation exposed Finance, payroll/fines, surveillance,
  advanced Communication/Analytics/Integrations, billing, platform operations,
  and unrelated peripheral prototypes contrary to locked launch scope.
- **Fixed:** the manifest had 95 declarations but only 85 unique paths because
  shared Work routes were duplicated under Employee and Org Admin. Shared paths
  now have distinct role-specific entries only where needed and remain
  role-aware.
- **Fixed and tested:** every visible path must exist in `ROUTE_REGISTRY` and
  grant the same role; launch navigation must exclude deferred/diagnostic route
  families.
- **Deferred:** `roleConfig.ts` contains a second, older navigation tree with
  deferred routes. Runtime sidebar navigation reads `NAV_MANIFEST`; rewriting
  that prototype config risks authorization assumptions and belongs with the
  later role/access implementation.
- **Deferred:** all direct registered legacy/deferred routes remain reachable.
  Production route exclusion and redirects require founder approval and route
  tests.
- **No broken canonical imports or duplicate registered paths found.** Route
  construction in `App.tsx` is registry-generated, so manifest pruning does not
  remove screens.

## Founder decision and acceptance recommendation

**Decision requested:** approve or reject this role navigation, canonical
matrix, merge list, and redirect/retirement plan as a package. There are no
additional business-policy questions required to complete Phase 3; OQ-004 and
OQ-005 remain deferred and do not block approval.

**Recommendation:** approve the packet, then mark Phase 3 VERIFIED / COMPLETE.
Only after approval should a new change implement redirects, production route
exclusion, and parity merges. Do not start Phase 4 in this run.
