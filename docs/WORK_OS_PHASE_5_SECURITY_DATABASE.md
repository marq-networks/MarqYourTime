# Work OS Phase 5 — Security and Database Foundation

**Status:** PHASE 5 — REMOTE VERIFICATION IN PROGRESS
**Remote database:** APPLIED AND HARDENED. The initial Tenant, Organization, and Platform Admin membership bootstrap exists; final real login/JWT verification remains open.

## 1. Schema overview

The forward-only migration creates `tenants`, `organizations`, `user_profiles`, `memberships`, `departments`, `worker_profiles`, and append-only `audit_events`. UUID primary keys, explicit timestamps, checks, unique constraints, indexes, and restrictive foreign-key deletion behavior are declared in the migration. Supabase `auth.users` remains the identity/session authority; `user_profiles` is only a public reference/profile extension. No Work, Time, Reporting, Finance, payroll, fines, surveillance, advanced Communication, Analytics, or Integration schema is introduced.

## 2. Tenant and organization relationship

A tenant is the customer/account boundary and owns one or more organizations/workspaces. Every membership, department, worker profile, and organization-scoped audit event carries a tenant/organization pair protected by a composite foreign key. This prevents an organization ID from being paired with another tenant. Destructive tenant or organization cascades are intentionally disallowed.

## 3. Membership and RBAC semantics

Each membership binds one `auth.users.id` to exactly one organization and its tenant, one constrained role (`employee`, `org_admin`, or `platform_admin`), a status, and optional soft-deletion timestamp. A partial unique index prevents duplicate live user/organization memberships. Only `active` and non-deleted rows authorize access.

Organization administrators are scoped to each organization for which they hold an active `org_admin` membership. Platform capability is established by an active backend `platform_admin` membership; it is never read from browser state. Platform assignments still have a non-null anchor organization/tenant so there is no ambiguous nullable scope. That role grants the explicit global policies in this foundation. Creating the initial Platform Admin remains a reviewed operational bootstrap step.

## 4. RLS policy matrix

All seven tenant-sensitive tables have RLS enabled and forced. Absence of a policy denies access.

| Table | Employee | Org Admin | Platform Admin | Browser mutation |
|---|---|---|---|---|
| tenants | Read membership tenant | Read membership tenant | Read all | None |
| organizations | Read active organization(s) | Read administered organization(s) | Read all | None |
| user_profiles | Self/shared active-org read; self safe-column update | Shared-org read; own update | Read all; own update | Narrow own update only |
| memberships | Read own active rows | Read rows in administered org | Read all | None |
| departments | Read member org | Read and insert/update own org | Read and insert/update | Scoped columns; no delete |
| worker_profiles | Read member org | Read administered org | Read all | None |
| audit_events | No read | Read own-org events | Read all | No insert/update/delete |

`is_active_member`, `is_org_admin`, and `is_platform_admin` are stable, tightly scoped `SECURITY DEFINER` predicates with fixed safe `search_path`. They query backend memberships with active/deleted checks, avoiding recursive membership RLS. Execute is granted only to authenticated callers; table policy still determines access.

## 5. Trusted-operation matrix

| Operation | Boundary | Required proof / implementation |
|---|---|---|
| Invitations and acceptance | `identity-administration` Edge Function | Validate payload, verify Supabase session, recompute actor membership, administer identity, compensate a failed membership write, and activate JWT-derived invitations with atomic audit |
| Membership create/remove | Edge Function/server + `trusted_set_membership` | Server-only service-role client; DB rechecks actor membership and scope |
| Role change | Same trusted path | Org Admin can assign only non-platform roles in own org; Platform Admin required for platform role |
| Platform cross-tenant operation | Edge Function/server | Active backend Platform Admin membership; explicit target and audit |
| Identity administration | Edge Function/server | Admin Auth API secret remains server-only |

The shared Edge contracts and `identity-administration` handler are implemented in the repository but not yet deployed. The handler accepts only bounded invite/accept commands, verifies the caller token, recomputes active backend administration rights before sending an invitation, calls service-role-only database functions, and never accepts a user ID for invitation acceptance. No service-role credential is present in browser code or repository configuration.

## 6. Audit model

`audit_events` records a backend-derived actor, tenant, organization, role-at-action, action, target type/ID, server timestamp, source, generated/request correlation UUID, and bounded JSON metadata. Ordinary clients receive no audit mutation policy or mutation grant. `trusted_set_membership` re-authorizes its actor from membership rows and writes the membership change and audit event in the same database transaction. Future privileged functions must follow that atomic pattern. Failed attempts require trusted-boundary operational logging because a transaction that raises cannot retain a row in the same transaction.

## 7. Frontend AuthContext

`AuthProvider` initializes from `supabase.auth.getSession`, maintains the Supabase session/user, subscribes exactly once to `onAuthStateChange`, unsubscribes on teardown, and exposes password sign-in, sign-out, and recovery-session password replacement. A `PASSWORD_RECOVERY` event preserves the authenticated session while entering an explicit recovery mode that later `SIGNED_IN`, `TOKEN_REFRESHED`, and `USER_UPDATED` events cannot overwrite. The recovery gate renders before `OrganizationProvider` and updates through the existing browser client. Password persistence and post-update sign-out are separate outcomes: an accepted update always produces truthful success, while cleanup failure produces bounded close-tab guidance and clears application recovery state without exposing provider details. Same-password and weak-password errors receive retry guidance; invalid/expired sessions alone receive new-link guidance. It does not contain a role or membership. The prior `sessionStorage` boolean/role prototype is isolated from application composition and no longer authenticates the shell.

The existing login visual remains bounded, but its entered email/password are now passed to Supabase Auth. Production-facing demo credentials and autofill were removed. Selecting a portal changes presentation only; it is not authorization evidence.

Sign-in provider messages are translated to bounded credential or throttling guidance before reaching the UI. The login surface also provides a forgot-password request state backed by `resetPasswordForEmail`, an explicit same-origin `/reset-password` redirect, normalized input, enumeration-safe success copy, and bounded provider/rate-limit failures. Focused tests prove these client boundaries; SMTP delivery, redirect allowlisting, and project-level rate-limit behavior still require remote verification.

## 8. OrganizationContext

After authentication, the context passes the authenticated user ID to the membership repository, which explicitly selects that user's active, non-deleted rows through the single browser Supabase client. This `user_id` filter is result selection, not authorization proof: RLS remains the authorization boundary, including Platform Admin's legitimate global administrative read capability. Returned current-user rows are mapped through the membership repository. A stored organization ID is only a preference: startup accepts it only when it matches freshly returned membership; otherwise the first valid membership is selected or no-access is shown.

Switching clears active context before a fresh membership read, rejects unavailable organizations, then persists the validated preference and emits `workos-organization-changed`. Organization-scoped future query adapters must listen/use this boundary to clear keys and refetch. Sign-out immediately clears memberships and active context through the user dependency.

## 9. Protected shell behavior

The shell follows: auth initialization → loading; unauthenticated → existing login; authenticated and memberships loading/switching → loading; load failure → safe unavailable state; no memberships → safe no-access state; memberships without a validated active membership → safe unavailable state; valid active membership → application. Navigation and route guards use the membership-derived presentation role but remain UX only. RLS/trusted server policy is enforcement.

## 10. Migration inventory

- `20260818000100_phase_5_security_foundation.sql`: types, tables, constraints/indexes, security predicates, forced deny-by-default RLS policies, grants, and trusted atomic membership/audit function.
- `20260819000100_phase_5_security_function_acl.sql` and `20260819000200_phase_5_table_privilege_hardening.sql`: remotely applied function/table privilege corrections.
- `20260819000300_trusted_invitation_acceptance.sql`: pending deployment; service-role-only invitation activation and correlated atomic audit.
- The foundation and hardening migrations are applied remotely; the invitation acceptance migration is the next forward-only remote change.

## 11. Security and policy test inventory

`phase_5_rls.sql` is a pgTAP transaction that seeds two tenants and organizations and proves sixteen required cases: anonymous privilege-layer denial; employee cross-org denial; self-promotion denial; denial of employee job-title and department updates; same-org success; unrelated Org Admin denial; Org Admin platform promotion denial; backend-derived Platform Admin global access alongside current-user-only membership selection; inactive denial; submitted organization/filter inability to bypass; audit delete denial; authenticated invitation-function denial; trusted acceptance; and correlated acceptance audit. It rolls back all fixtures. Run via `supabase test db` after `supabase start` and migration reset.

## 11.1 Reviewer-found Phase 5 corrections

Reviewer inspection found and repository changes corrected three pre-verification issues: Platform Admin rows visible through intentional administrative RLS were previously allowed into current-user organization context; Protected Shell checked only a non-empty membership list rather than a validated active membership; and employees had unapproved update access to authoritative worker job/department assignments. The current-user filter and regression test, active-membership shell guard, removed worker-profile mutation policy/grant, and corrected privilege-oriented pgTAP assertions address those findings without weakening administrative RLS. These corrections have not been applied to any remote database.

## 12. Debugging findings

| Finding | Classification | Disposition |
|---|---|---|
| One existing browser Supabase client uses URL/publishable key only. | SAFE FIX baseline | Preserved. |
| `App` treated `sessionStorage` auth flag and role as session authority. | PHASE 5 BLOCKER | Replaced in composition with Supabase AuthContext. |
| Login portal, role store, role switcher and route guard treated selected/stored role as authority. | PHASE 5 BLOCKER | Shell derives role from validated membership; role switch controls removed from production composition. Route guard documented as UX only. |
| Mock organizations were rendered as authoritative choices. | PHASE 5 BLOCKER | Replaced with RLS-returned active memberships. |
| Active organization preference lacked validation and stale-state clearing. | PHASE 5 BLOCKER | Added preference revalidation and clear-before-refetch switching. |
| No production schema, RLS, policy tests, or trusted audit mutation. | PHASE 5 BLOCKER | Added migration, predicates, forced RLS, pgTAP suite, trusted function. |
| Legacy `AuthSession`, `AuthApiService`, role store, and many prototype screens still contain storage roles/org data. | PHASE 6 / FUTURE DOMAIN ISSUE | Isolated from the protected-shell authority; retire incrementally with canonical slice migrations, not broad Phase 5 cleanup. |
| Full Work/Time/Reporting domain persistence is absent. | FUTURE DOMAIN ISSUE | Correctly deferred. |

Bounded searches found no `VITE_*` service-role/password secret, second `createClient`, public `USING (true)`, client audit actor input, or new-table RLS omission.

## 13. Known limitations

- Remote Supabase has the foundation/hardening chain; the new invitation-acceptance migration and Edge Function remain pending deployment.
- Local policy execution requires Docker and the Supabase CLI; repository pgTAP coverage is present but results must not be inferred where tooling is unavailable.
- Invitation/identity Edge code requires deployment and remote threat/E2E testing; email delivery, redirect allowlisting, expiry, duplicate identity behavior, and provider rate limits are not proven locally.
- Initial tenant, organization, and Platform Admin bootstrap needs a reviewed operator runbook and trusted administrative execution.
- Worker-profile fields are intentionally minimal and browser read-only; authoritative employment administration belongs to a later approved administration boundary.
- Prototype routes/screens remain registered and may display mock data after shell entry; their data is not production authority.

## 14. Remote deployment checklist

1. Founder/reviewer inspects migration, grants, functions, RLS matrix, test fixtures, and frontend boundary.
2. Back up/export schema and confirm recovery point; verify target project and migration history.
3. Verify only URL/publishable key reaches Vite and service-role is available only to the selected trusted runtime.
4. Run `supabase start`, `supabase db reset`, and `supabase test db` locally against the exact reviewed commit.
5. Apply migration to a non-production/staging project first; run all negative/positive policy tests with real JWTs.
6. Bootstrap tenant/org/initial Platform Admin through reviewed operator procedure; test inactive/deleted behavior.
7. Deploy trusted operations only after auth, input validation, rate limiting, safe logging, and correlation behavior are reviewed.
8. Apply production migration in a maintenance/change window, rerun smoke/policy verification, then deploy frontend.
9. Monitor Auth, Postgres/RLS errors, audit insertion, and cross-tenant probes. Stop and recover on invariant failure.

## 15. Rollback and recovery considerations

This migration is forward-only. Do not edit it after remote application. Before apply, take a backup and record migration state. If verification fails before application, amend/review repository artifacts. If it fails after application, stop writes and frontend rollout, restore the database to the pre-migration recovery point when data integrity/security is uncertain, or ship a separately reviewed forward corrective migration. Never weaken/disable RLS as an emergency workaround. Audit events should be retained through recovery except where the database itself is restored; export incident evidence first when safe.

## 16. Phase 5 acceptance status

**PHASE 5 — REMOTE VERIFICATION IN PROGRESS.** The remote database foundation is applied and hardened. Founder evidence confirms that the changed password authenticates the real user and loads the expected MARQ Networks Platform Administrator console. GAP-064 remains fixed awaiting founder re-test. GAP-002 is fixed in the repository and awaits its forward migration, Edge deployment, and remote invite/accept security journeys. Phase 5 remains incomplete pending those checks, JWT/logout evidence, Employee and Org Admin journeys, cross-role/cross-organization negatives, recovery delivery/redirect/expiry cases, and remote throttling behavior.
