# Work OS Phase 4 — Technical Architecture decision packet

**Status:** PHASE 4 — DECISION PACKET READY  
**Prepared:** 2026-08-18  
**Approval:** Founder review required; Phase 4 is not complete.  
**Scope:** Architecture verification only. No production schema, migration, Auth, RLS, or RBAC was implemented.

## 1. Architecture verdict

**Recommend approval with the boundaries in this packet.** The proposed direction is sound, but it does not describe today's runtime. Production should use a thin React application layer over domain-owned repository contracts, with a single Supabase browser client for ordinary RLS-protected work and trusted server/Edge Functions for privileged work. The current prototype instead mixes embedded data, React-owned in-memory records, local storage, and overlapping services.

No product decision blocks this architecture. Phase 5 must prove the security model; this packet does not claim that production authorization or persistence exists.

## 2. Current-state trace

| Capability | Current trace | Source / storage | Boundary finding |
|---|---|---|---|
| People Directory (`/people/employees`) | `A03Users` re-export → `P01EmployeeManagement` → component state and handlers → direct `employeeData` import | embedded mock seed + `localStorage` (`workos_employees`) | Canonical screen bypasses `IPeopleService`; validation, ID creation, mapping, CRUD, filtering, and persistence leak into the screen. It also uses a different `Employee` shape from the service contract. |
| Memberships | `A04Members` → `usePeopleData` → context `people` service → `ServiceProvider` state | embedded `mockData` + browser-only in-memory React state | A usable seam exists, but membership is represented as employee CRUD and is not a production membership/security model. |
| Canonical Work | `Work*OS` screens → `useExecutionOS` → `ExecutionOSContext` callbacks | embedded `workMockData` + browser-only React state | Screens use a large UI context instead of the registered `IExecutionOSService`. `ExecutionOSMockService` duplicates the data and mutation implementation, so two unsynchronized Work stores exist. |
| Time sessions | `A07Sessions` → `useTimeData` → `time` contract → `ServiceProvider` mock implementation | embedded `mockData` + browser-only in-memory React state | Closest current example of the intended direction. The hook over-fetches unrelated Time collections and reduces plain `Error` to a string. |
| Employee time entry/work session | canonical employee screens contain generated/local component behavior; Work time logs also live in `ExecutionOSContext` | embedded mocks, browser-only state, and some local storage in legacy Work screens | Time has multiple model/store owners; none is authoritative. |
| Essential Reports | `A19Reports` → People/Time/Analytics hooks plus component-owned templates/generation simulation | service-provider mock data + embedded templates + browser-only state | Reporting correctly reads other domains in concept, but includes deferred Finance/fines templates and simulates generation in the screen. |
| Tenant Audit | `A22AuditLogs` → `useAnalyticsData` → analytics service → provider activity array | embedded mock + browser-only in-memory state | Audit reads an analytics mock; mutation-created activity is not atomic, actor values can be client-authored, and errors are not surfaced consistently. |

`src/lib/supabase.ts` is the only instantiated Supabase client found. It is configuration foundation only: no inspected production business flow uses it. `ServiceProvider` is a monolithic mock registry whose object implementations are recreated on render; hooks depending on service object identity can refetch more often than intended. Current `App` login, role store, route guard, and developer role switcher are presentation prototypes, not security.

## 3. Target layer diagram

```text
Screen / component (render, interaction, ephemeral UI state)
  ↓ imports domain hook/use-case only
Domain hook / use-case (orchestration, query lifecycle, validated commands)
  ↓ depends on domain contract and domain types
Repository contract (framework-free, storage-neutral)
  ↓ implemented by one selected adapter
Mock adapter | Supabase adapter | trusted server adapter
                  ↓                    ↓
       shared browser client + RLS   endpoint/Edge Function + server authorization
                  └──────────── Postgres authoritative records ────────────┘

Auth context + organization context feed query keys/commands.
Validation, structured errors, diagnostics, and audit span every I/O mutation boundary.
```

Use React's existing hooks/context primitives for the first bounded query slice. The repository has no server-state library and no Zod-like runtime schema dependency. Do not add a query library merely for architectural symmetry; reassess only when production caching, invalidation, deduplication, and retry needs are demonstrated.

## 4. Dependency and ownership rules

**Permitted direction:** UI → domain application code → repository contract/domain model; composition root → adapters; adapter → Supabase client or trusted endpoint. Cross-cutting code may be consumed by domain/application and adapters. Analytics imports read contracts/projections, never another domain's adapter or mutable store.

**Forbidden:** screens importing Supabase, adapter implementations, database row types, or authoritative mock data; repository contracts importing React/UI types; domain code importing screens; adapters importing hooks; direct cross-domain mutation; browser code importing secret-bearing clients; UI-selected roles or organization IDs granting access.

Contracts live with the owning domain (for example `people/application` or `people/repositories`), not in one ever-growing global contract file. Contracts expose domain language and explicit query/command objects, not Supabase query builders, JSX, toast text, table rows, or browser-storage details. Keep layers thin: a simple read need not gain a controller, DTO mapper, service, manager, and gateway.

## 5. Authentication context design

Phase 5 flow:

```text
Supabase Auth session
→ AuthContext { status, user identity, session lifecycle }
→ backend-readable explicit memberships
→ OrganizationContext active membership
→ membership-derived role/permissions
→ route/navigation availability (presentation only)
→ repository query / mutation
→ RLS or trusted server authorization (enforcement)
```

Auth context owns session readiness, authenticated user identity, sign-in/out lifecycle, and token refresh. It must not own a client-selected role or fabricate memberships. While membership is loading, protected application content remains unavailable. Route guards and navigation improve UX only; RLS/server checks are final.

## 6. Tenant / organization context design

Organization context owns the memberships returned for the authenticated identity, the active tenant/organization selection, switching state, and membership-derived capabilities for presentation. The tenant relationship and allowed organizations are backend-derived. A persisted organization ID may be a convenience preference only; after reload it must be checked against fresh memberships before use.

Every tenant-sensitive query/mutation carries or derives organization scope. An organization ID, tenant ID, user ID, role, or permission read from URL, form, local/session storage, or React state is untrusted input. RLS/server code must bind access to authenticated membership. Organization switching cancels/ignores in-flight old-scope results, clears domain caches, and refetches using keys containing authenticated user and organization IDs. Never show stale prior-organization records during transition.

## 7. State ownership rules

| State | Owner / persistence rule |
|---|---|
| People, Work, Time, memberships, reports, audit records | Server state behind repositories; database/API is authoritative. Query state may cache in memory and must be scoped/invalidateable. Never persist authoritative records in long-lived browser storage. |
| Drawers, dialogs, tabs, selection, unsaved forms, transient filters | Component or narrowly scoped UI context. A harmless preference/filter may persist, but cannot affect authorization or become a domain record. |
| Session | Supabase Auth lifecycle surfaced through Auth context; do not create a parallel home-grown credential/session record. |
| Active organization | Organization context; optionally persist only its ID as an untrusted preference, then revalidate. |
| Role/permissions | Derived from current authenticated membership; not independently persisted or selected as authority. |

Hooks should expose query status (`idle/loading/success/error`), data, refresh, and mutations without copying the same authoritative collection into multiple contexts. Mutation success invalidates/refetches affected query keys; optimistic updates are allowed only with rollback and organization-safe keys.

## 8. Repository contract rules

- One contract per domain capability, framework-free and adapter-neutral. Prefer narrow interfaces (`PeopleDirectoryRepository.list`) over the current global registry when migrating.
- Accept explicit validated query/command types; return domain objects or page/result types, never `any`, raw Supabase responses, or presentation strings.
- Reject failures as `AppError` (below). Do not alternate between `{ success, error: string }` and thrown generic errors.
- Make tenant scoping visible in adapter/use-case composition. The client may send an organization ID, but that is a filter request, never authorization proof.
- Production adapters validate external responses before mapping to domain objects and translate Supabase/HTTP failures without leaking internals.
- Mock adapters implement the identical contract and semantics, including pagination, missing-record behavior, validation, and failure categories.

## 9. Adapter rules

Select adapters once in the application composition root; screens never branch on mock/production mode. Retain `ServiceProvider` temporarily as a compatibility source for already-wired mock domains, but extract domain-specific adapters as each production slice begins. Do not expand the provider or `services/types.ts` global model.

The Supabase adapter imports the single `src/lib/supabase.ts` browser client and may perform ordinary authenticated, tenant-scoped operations designed for RLS. A server adapter invokes a same-origin endpoint/Edge Function for privileged behavior. Adapters parse rows/responses, map errors, and emit safe diagnostics. Never instantiate per-screen clients.

## 10. Validation boundary

```text
form values → client schema parse → validated command → use-case/repository
external row/response → adapter schema parse → mapped domain object
privileged request → server schema parse → authenticate → authorize → mutate
```

Client validation is usability, not security. All privileged and integrity-relevant inputs are validated again in trusted code; database constraints remain the last integrity boundary. Responses are untrusted too. The repository currently has hand-written required-field checks but no suitable schema library. Phase 5/first production slice may deliberately add a small runtime schema dependency (Zod is the preferred candidate) or a bounded typed parser; it must not create schemas for every prototype domain at once.

## 11. Structured error model

Minimal model:

```ts
type AppErrorCode =
  | 'validation' | 'unauthenticated' | 'forbidden' | 'not_found'
  | 'conflict' | 'transient' | 'internal' | 'unknown';

interface AppError {
  code: AppErrorCode;
  message: string;          // safe, user-presentable fallback
  retryable: boolean;
  fieldErrors?: Record<string, string>;
  correlationId?: string;
  cause?: unknown;          // diagnostics only; never rendered/serialized to clients
}
```

Adapters translate Supabase/HTTP/parser failures to `AppError` and throw them. Hooks preserve the code/correlation ID and compose loading/retry state. Screens render field errors, sign-in prompts, forbidden/not-found states, retry affordances, or a generic failure as appropriate. Diagnostics record operation name, safe IDs, code, correlation ID, and stack/cause in an approved sink; logs and UI must omit tokens, credentials, SQL, private row data, and raw backend messages. The current mix of `ServiceResponse.error` strings, generic thrown `Error`, swallowed promises, console output, and hook-only `e.message` is contradictory and must be retired slice by slice.

## 12. Privileged-operation rules

**Eligible for browser access only when authenticated and protected by tested RLS:** tenant/organization-scoped reads; ordinary member-owned updates; scoped People/Work/Time mutations whose policy can be expressed and tested safely; read-only reports/audit views with explicit scope policies.

**Trusted server/Edge Function required:** invitations and invite acceptance orchestration; privileged membership/role changes; Platform Admin cross-tenant operations; any service-role/secret credential; identity administration; external integrations/secrets; webhooks, billing, and scheduled/system maintenance; multi-step mutations whose authorization/audit atomicity cannot be safely expressed through the browser path.

Server placement does not itself confer trust: endpoint input is parsed, session identity verified, membership/permission authorized, and scope recomputed server-side. Service-role access is narrowly contained and never accepts client claims as proof.

## 13. Audit architecture

The domain use-case declares that an important mutation is auditable, but durable audit creation occurs in the same trusted transaction as the mutation—prefer a database function/trigger or trusted server transaction, selected during Phase 5 design. A client-side second call is not atomic and is not acceptable for security-relevant events.

Derive actor identity, tenant/organization, membership/role-at-action, timestamp, request/correlation ID, and trusted source from authenticated/server context. The command may supply a bounded business reason, but must not supply authoritative actor, role, scope, timestamp, or outcome. Record action, target type/ID, safe before/after change summary (subject to minimization), outcome, and correlation data. Audit records are append-only to ordinary clients; reads and exports are separately authorized. Failed privileged attempts may be logged through the trusted boundary even when no domain mutation commits.

## 14. Mock-to-production migration strategy

1. Choose one canonical screen and describe its domain query/command in owned domain types.
2. Add a narrow repository contract and a compatibility mock adapter over the existing behavior.
3. Move orchestration into a stable hook/use-case; keep rendering and ephemeral controls in the screen.
4. Contract-test mock behavior and error semantics.
5. In Phase 5+, add the validated Supabase/server adapter and run the same contract suite plus RLS/policy tests.
6. Switch the composition root; remove the compatibility path only after parity and route proof.

Retain the useful concepts in `usePeopleData`/`useTimeData` (async lifecycle) and the provider as temporary composition. Adapt, then retire, canonical screens' direct local-storage persistence. Retire the duplicate `ExecutionOSContext`/`ExecutionOSMockService` ownership pattern by choosing one repository-backed Work state source during the future Work slice; do not synchronize two stores. Local storage remains acceptable only for explicitly non-authoritative preferences/drafts.

## 15. Bounded proof result / design

**Result: design-only; no source proof forced.** The preferred People Directory read is not safely bounded today: the canonical screen imports a separate employee model, owns CRUD and local-storage persistence, while the existing People service uses another contract and mock dataset. A superficial interface around either would certify the wrong production model and obscure the Phase 3 merge-required work.

The first approved implementation proof should be a **read-only directory slice** after Phase 5 establishes identity/membership scope: `PeopleDirectoryScreen → usePeopleDirectory → PeopleDirectoryRepository.list(query) → compatibility mock`, followed by a Supabase adapter only after schema/RLS approval. Contract tests must cover pagination/filter input, parsed output, organization isolation, and structured errors. Keep the proof to the screen/hook, one domain contract/types module, one adapter/composition change, and tests; stop if it exceeds the change budget.

## 16. Bounded debugging findings

| Finding | Classification | Disposition |
|---|---|---|
| Exactly one Supabase client; it uses only URL + publishable key. | SAFE BASELINE | Verified; no fix. |
| Canonical People stores authoritative employee records in local storage and bypasses the service seam. | PHASE 4 DESIGN ISSUE | Migration seam specified; no broad refactor. |
| Work has two independent in-memory implementations (`ExecutionOSContext` and registered mock service); canonical screens use only the context. | PHASE 4 DESIGN ISSUE | One repository-backed owner required in future Work slice. |
| Provider recreates service objects while hooks depend on their identity, risking repeated fetches after provider state updates. | PHASE 4 DESIGN ISSUE | Production adapters/composition must have stable identity; avoid risky monolith memoization now. |
| Auth/route guard/role switcher and active organization are client-controlled prototypes. | PHASE 5 ISSUE | Replace with authenticated membership contexts and enforced policies. |
| Generic errors, result-string errors, swallowed failures, and console logging coexist. | PHASE 4 DESIGN ISSUE / PHASE 6 ISSUE | Error contract locked here; operational sink and broad adoption later. |
| Reports include Finance, fines, payroll, and productivity templates outside approved launch scope. | FUTURE DOMAIN ISSUE | Preserve prototype; canonical launch report contract must exclude them during implementation. |
| Audit activity is mutable/mock and client-attributed. | PHASE 5 ISSUE | Trusted, atomic audit foundation required for security mutations. |
| No response-schema validator dependency exists; hand-written validation is mutation-only. | PHASE 4 DESIGN ISSUE | Bounded parser/schema dependency decision delegated to first production slice. |
| Numerous legacy screens persist domain records independently in local storage. | FUTURE DOMAIN ISSUE | Replace incrementally; no generic cleanup. |

No unambiguous source-code safe fix was necessary. Documentation is the bounded correction: it prevents prototype seams, browser roles, and local storage from being mistaken for production architecture.

## 17. Security invariants

1. Only `VITE_SUPABASE_URL` and a browser-safe publishable key may enter the client bundle. Service-role keys, secret keys, database passwords, integration secrets, and management tokens never use `VITE_*`.
2. Navigation and route visibility are presentation, never authorization.
3. Authorization derives from authenticated explicit membership, not a selected role, URL, storage value, or request body claim.
4. Every tenant-sensitive production table requires an explicit deny-by-default access policy and policy tests before browser use.
5. Privileged/cross-tenant/secret-bearing operations execute in trusted server context with independent validation and authorization.
6. Tenant/organization scope is verified at the data boundary on every operation.
7. Errors, logs, telemetry, and audit summaries never leak secrets, tokens, SQL, raw backend diagnostics, or unnecessary personal data.
8. Security-relevant audit actor/context is trusted and audit writes are atomic with successful mutations.

## 18. Phase 5 handoff contract

After founder approval, Phase 5 **may** implement: Supabase Auth session integration; a protected application shell; Tenant, Organization/Workspace, User Identity, and explicit Membership foundations; the three approved launch roles; validated active-organization context; production schema foundation for approved scope only; deny-by-default RLS and policy tests; RBAC/permission enforcement; and audit foundations required for security-relevant changes.

Phase 5 must use the single browser client, contracts/adapters described here, backend-derived membership, structured errors, boundary validation, organization-scoped query invalidation, and trusted privileged/audit paths. It must not treat the prototype service types as schema, import the role switcher into authorization, add Finance/advanced domains, or claim security without negative cross-tenant policy tests.

Recommended Phase 5 proof order: Auth/session readiness → tenant/organization/membership model → active organization → deny-by-default policies and cross-tenant tests → minimal security audit mechanism → one bounded read adapter. Schema details and policy semantics remain Phase 5 review work, not decisions silently made here.

## 19. Unresolved founder decisions

No founder product-policy decision blocks approval. Founder review is required to approve or reject this architecture, including:

- the browser-RLS versus trusted-server classification rule;
- the two-context Auth/Organization design and untrusted persisted organization preference;
- the minimal `AppError` categories;
- atomic trusted audit generation; and
- design-only deferral of the People proof until its production identity/membership scope is available.

Detailed invitation lifecycle, membership permission matrix, audit retention/redaction, and which scoped mutations use database functions versus Edge Functions are Phase 5 design decisions and must be surfaced if product policy is needed rather than guessed.

## 20. Recommendation and stop

**Recommendation: APPROVE Phase 4.** On approval, record Phase 4 complete and proceed only to the Phase 5 handoff above. Until then:

**PHASE 4 — DECISION PACKET READY**

**Next action: FOUNDER REVIEW OF PHASE 4 DECISION PACKET.**

