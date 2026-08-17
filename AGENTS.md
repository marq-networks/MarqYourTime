# Work OS Engineering Guide

## Start here
- GitHub is the source of truth. Read the relevant section of [`docs/WORK_OS_ROADMAP.md`](docs/WORK_OS_ROADMAP.md), [`docs/WORK_OS_DECISIONS.md`](docs/WORK_OS_DECISIONS.md), and [`docs/WORK_OS_PROGRESS.md`](docs/WORK_OS_PROGRESS.md) before changing code.
- Product-policy blockers belong in [`docs/WORK_OS_OPEN_QUESTIONS.md`](docs/WORK_OS_OPEN_QUESTIONS.md); do not guess business rules.
- `src/app/nav/navManifest.ts` defines visible navigation; `src/app/navigation/navRegistry.ts` maps routes to screens. Keep them aligned.

## Guardrails
- Preserve the React/Vite/Vercel/Supabase architecture. The browser uses only the Supabase URL and publishable key; never expose service-role or other secrets through `VITE_*`.
- Treat current auth, role switching, services, and most data as prototype behavior—not production security or persistence.
- Do not delete or consolidate generated screens until their canonical replacement is approved and route usage is proven.
- Keep domain ownership explicit; analytics reads domain data and security/audit is cross-cutting.

## Commands
- Install: `npm install`
- Develop: `npm run dev`
- Production build: `npm run build`
- There is currently no repository typecheck, lint, or test command; add those as deliberate production-foundation work.
