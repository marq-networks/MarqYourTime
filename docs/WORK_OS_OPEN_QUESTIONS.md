# Work OS Open Questions

Only questions that block product or irreversible architecture belong here. Recommendations are provisional until explicitly resolved.

Phase 1 + 2 repository verification on 2026-08-18 found no contradiction that
reopens OQ-001, OQ-002, or OQ-003. OQ-004 and OQ-005 remain deferred; legacy
prototype screens, navigation, types, and documents are evidence to reconcile
later, not approved policy.

## Resolved founder decisions

### OQ-001 — Initial product boundary — RESOLVED 2026-08-18
**Approved:** First production release = People Directory + Work Execution + Time Capture + Essential Reporting + Audit.  
**Deferred from first release:** Finance, advanced Communication/Analytics, payroll, fines, surveillance/productivity scoring, and other sensitive/advanced modules unless separately approved later.

### OQ-002 — Tenant and organization model — RESOLVED 2026-08-18
**Approved:** One tenant may contain one or more organizations/workspaces. Membership is explicit and production data access must enforce tenant/organization boundaries server-side with RLS.

### OQ-003 — Roles and permissions — RESOLVED 2026-08-18
**Approved:** Launch roles are Employee, Org Admin, and Platform Admin using backend-assigned memberships/permissions. Owner and Manager are reserved until their distinct permission semantics are defined. Browser role switching is not authorization.

## Open questions

### OQ-004 — Sensitive workforce features
**Question:** Are fines, screenshots/input counters, productivity scoring, leave rules, and payroll in product scope, and in which jurisdictions?  
**Recommended:** Exclude from the first production slice until legal/compliance requirements and exact policies are approved.  
**Alternatives:** (1) retain only configurable leave; (2) ship the represented suite after specialist review.  
**Consequences:** Deferral avoids encoding potentially unlawful or trust-sensitive behavior; inclusion requires jurisdiction-aware consent, retention, access, dispute, and audit requirements.  
**Blocked work:** related schemas, collection, calculations, UI consolidation, retention and reporting.

### OQ-005 — Finance meaning and canonical generation
**Question:** Is Finance expense reimbursement, project costing, payroll, accounting/ledger, SaaS billing, or some approved subset?  
**Recommended:** Separate employee expenses, operational project costing, and platform subscription billing; defer payroll/accounting ledgers.  
**Alternatives:** (1) expense-only; (2) full finance suite.  
**Consequences:** Separation respects different owners and controls; full finance scope requires accounting rules, currencies, periods, approvals, reconciliation, and compliance.  
**Blocked work:** choosing among `/finance/*` and `/org/finance/*`, canonical entities, migrations, calculations, and destructive consolidation.
