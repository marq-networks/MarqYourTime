# Work OS Open Questions

Only questions that block product or irreversible architecture belong here. Recommendations are provisional.

## OQ-001 — Initial product boundary
**Question:** Which modules constitute the first production release?  
**Recommended:** People directory + Work execution + Time capture + essential reporting/audit.  
**Alternatives:** (1) Work-only core; (2) broad suite including Finance and Communication.  
**Consequences:** The recommendation produces a coherent dependency spine with lower policy risk; Work-only is faster but weakens staffing/time workflows; broad suite greatly expands security, compliance, and data-model scope.  
**Blocked work:** canonical launch navigation, schema breadth, consolidation/deletion, Phases 7–9 sequencing.

## OQ-002 — Tenant and organization model
**Question:** Is one customer account exactly one organization, or can accounts contain multiple organizations/workspaces?  
**Recommended:** One tenant can contain one or more organizations, with all domain rows tenant-scoped and membership explicit.  
**Alternatives:** One tenant equals one organization.  
**Consequences:** Multi-org is more extensible but makes membership, switching, billing, RLS, and audit more complex; one-to-one is simpler but costly to reverse after launch.  
**Blocked work:** production schema, RLS policies, organization switching, invitations, platform administration.

## OQ-003 — Roles and permissions
**Question:** What are the final roles and permission semantics?  
**Recommended:** Backend-assigned memberships plus granular permissions; begin with Employee, Org Admin, and Platform Admin while reserving Owner/Manager until their differences are specified.  
**Alternatives:** (1) fixed five-role hierarchy described in the old constitution; (2) fully custom roles at launch.  
**Consequences:** The recommendation matches current surfaces without pretending the browser switcher is authorization; fixed roles are simpler but encode unapproved hierarchy; custom roles increase launch complexity.  
**Blocked work:** authorization schema, RLS, invitations, route enforcement, approval scopes.

## OQ-004 — Sensitive workforce features
**Question:** Are fines, screenshots/input counters, productivity scoring, leave rules, and payroll in product scope, and in which jurisdictions?  
**Recommended:** Exclude from the first production slice until legal/compliance requirements and exact policies are approved.  
**Alternatives:** (1) retain only configurable leave; (2) ship the represented suite after specialist review.  
**Consequences:** Deferral avoids encoding potentially unlawful or trust-sensitive behavior; inclusion requires jurisdiction-aware consent, retention, access, dispute, and audit requirements.  
**Blocked work:** related schemas, collection, calculations, UI consolidation, retention and reporting.

## OQ-005 — Finance meaning and canonical generation
**Question:** Is Finance expense reimbursement, project costing, payroll, accounting/ledger, SaaS billing, or some approved subset?  
**Recommended:** Separate employee expenses, operational project costing, and platform subscription billing; defer payroll/accounting ledgers.  
**Alternatives:** (1) expense-only; (2) full finance suite.  
**Consequences:** Separation respects different owners and controls; full finance scope requires accounting rules, currencies, periods, approvals, reconciliation, and compliance.  
**Blocked work:** choosing among `/finance/*` and `/org/finance/*`, canonical entities, migrations, calculations, and destructive consolidation.
