# HOAFlow — HOA Violation Manager

HOAFlow is a production-oriented SaaS platform for homeowner association operations: violations, properties, residents, notices, hearings, fines, evidence, inspections, documents, communications, and audit history.

## Stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS + shadcn-style Radix components
- Supabase Auth, Postgres (RLS), Storage
- Zod validation, Vitest tests
- Vercel deployment

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase credentials the app runs in **demo mode** with seeded sample data. Add credentials to `.env.local` for auth and persistence.

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production | Public anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Invites, org settings, admin jobs |
| `NEXT_PUBLIC_APP_URL` | Yes | Auth redirect base (e.g. `http://localhost:3000`) |
| `HOAFLOW_SMOKE_BASE_URL` | Optional | Smoke test target (default `http://127.0.0.1:3000`) |

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.

## Database

Migrations in `supabase/migrations/`:

1. `20260530000000_initial_schema.sql` — core tables, RLS, audit triggers
2. `20260530000001_platform_enhancements.sql` — org creation, notification prefs
3. `20260530000002_operations_modules.sql` — fines, meetings, work orders, vendors
4. `20260530000003_violation_workflow.sql` — notices, hearings, status history

Apply with the Supabase CLI:

```bash
supabase link --project-ref ckussqxgvuclnkrgwzaz
supabase db push
supabase db seed
```

Storage buckets: `hoa-documents`, `violation-evidence`. Object paths must start with the organization UUID.

## Violation Workflow

Supported statuses: `draft`, `open`, `under_review`, `notice_sent`, `warning_sent`, `hearing_scheduled`, `appealed`, `fine_pending`, `resolved`, `closed`.

The violation detail page (`/dashboard/violations/[id]`) includes:

- Status workflow with history timeline
- Notices (create and track delivery state)
- Hearings (schedule, location, outcome)
- Linked fines
- Comments, evidence attachments, edit form

Dashboard KPIs: open violations, resolved, overdue, scheduled hearings, outstanding fines, inspections.

## Product Surface

- Marketing landing page, help center, resident portal
- Auth: signup, login, magic link, password reset, invite accept
- Dashboard modules: residents, properties, violations, architecture, inspections, documents, communications, activity, settings, reports, calendar, search
- Operations: fines, board meetings, work orders, vendors
- CSV export/import, global command menu (`Cmd/Ctrl + K`), light/dark mode

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest unit tests |
| `npm run verify` | Project structure validation |
| `npm run smoke` | HTTP smoke tests (requires running server) |

Full validation:

```bash
npm run lint && npm run typecheck && npm test && npm run build && npm run verify
npm run dev   # separate terminal
npm run smoke
```

## Deployment

1. Create a Vercel project from this repository.
2. Set all environment variables from `.env.example`.
3. Apply Supabase migrations and configure Auth redirect URLs.
4. Deploy — Vercel uses `npm install` + `npm run build` (see `vercel.json`).

Post-deploy:

```bash
curl https://your-domain.com/api/health
HOAFLOW_SMOKE_BASE_URL=https://your-domain.com npm run smoke
```

See `docs/deployment.md` for the full runbook.

## Documentation

| Doc | Contents |
|-----|----------|
| `docs/repo-audit.md` | Stack audit, gaps, repair strategy |
| `docs/rebuild-plan.md` | Implementation plan |
| `docs/security-review.md` | Security findings and fixes |
| `docs/verification.md` | Validation results and run steps |
| `docs/api.md` | REST API reference |
| `docs/deployment.md` | Deploy runbook |

## Security

- RLS on every application table; tenant isolation by `organization_id`
- Server-side authorization in all mutation actions
- Private storage buckets with org-scoped policies
- Database audit triggers on tenant tables
- Service role used only for admin operations (invites, org settings)

## Limitations

- Evidence upload on violation create form not yet implemented (available on detail page)
- No Playwright/Cypress E2E suite (HTTP smoke + unit tests)
- Category delete action exists but no settings UI button yet
