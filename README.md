# HOAFlow

HOAFlow is a production-oriented SaaS starter for modern homeowner association management. It replaces spreadsheets, PDFs, email chains, text messages, and paper forms with a centralized cloud platform for violations, residents, properties, inspections, architectural requests, documents, communications, and audit history.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS with shadcn-style components
- Supabase Auth, Postgres, Storage, and Realtime-ready schema
- Vercel deployment configuration

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Only use `SUPABASE_SERVICE_ROLE_KEY` in server-only scripts or jobs. Never expose it in browser code.

## Supabase

The repository includes:

- `supabase/config.toml`
- `supabase/migrations/20260530000000_initial_schema.sql`
- `supabase/seed.sql`
- `.mcp.json` for the project-scoped Supabase MCP server

Apply the schema with the Supabase CLI after linking the project:

```bash
supabase link --project-ref ckussqxgvuclnkrgwzaz
supabase db push
supabase db seed
```

The migration enables RLS on every application table, isolates all tenant data by `organization_id`, and creates private storage buckets for documents and violation evidence. Storage object paths should start with the organization UUID, for example:

```text
00000000-0000-4000-8000-000000000001/violations/photo-1.jpg
```

Dashboard pages use tenant-aware server loaders. When Supabase environment variables and an authenticated membership are available, tables are read through RLS. Without local credentials, the app falls back to polished demo data so the product can still be reviewed.

## Product Surface

- Landing page with hero, features, benefits, testimonials, pricing, FAQ, and footer
- Supabase-backed login, magic-link, auth callback, and password recovery flow
- Protected dashboard routes
- Command menu with `Cmd/Ctrl + K`
- Light and dark mode
- Dashboard overview metrics, trend analytics, activity feed, and quick actions
- Modules for residents, properties, violations, architectural requests, inspections, documents, communications, audit activity, and settings
- Server-action workflows for creating core records, scheduling inspections, sending password resets, inviting users, and uploading document versions or violation evidence
- Loading, empty, and error states

## Security Notes

- RLS is enabled on every table in the public schema.
- Tenant access is enforced through active memberships.
- Write policies require a tenant membership role with write permission.
- Private helper functions live in a non-exposed `private` schema to avoid recursive membership policies.
- File storage policies validate organization membership from the first path segment.
- Upload actions write to private buckets using organization-prefixed paths and then record metadata in Postgres.
- Auth users are mirrored into `profiles` by a private database trigger.
- Tenant tables have database-level audit triggers that append activity log events for inserts, updates, and deletes.
- Authorization should remain server-side for future route handlers and server actions.

## API

Tenant-scoped route handlers are available under `/api` for residents, properties, violations, documents, architectural requests, inspections, and activity logs. See `docs/api.md` for request shapes and auth behavior.

## Deployment

1. Create a Vercel project from this repository.
2. Add the environment variables from `.env.example`.
3. Link the Supabase project and apply migrations.
4. Configure Supabase Auth redirect URLs for your Vercel domain.
5. Deploy with `npm run build` or Vercel’s default Next.js pipeline.

See `docs/deployment.md` for the full deployment runbook and smoke-test checklist.

## Verification

```bash
npm run verify
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
npm run smoke
```

`npm run smoke` expects a running app and uses `HOAFLOW_SMOKE_BASE_URL` when checking a deployed environment.

CI runs the same gates in `.github/workflows/ci.yml`.
