# HOA Violation Manager — Repository Audit

**Audit date:** 2026-05-30  
**Repository:** `HOA-Violation-Manager` (product name: HOAFlow)  
**Branch:** `main` @ `1e4d3dd`

---

## 1. Current Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.5.18 (App Router) |
| UI | React 19.1.1, Tailwind CSS 3.4, shadcn-style Radix components |
| Language | TypeScript 5.9 |
| Package manager | npm (lockfile: `package-lock.json`) |
| Auth | Supabase Auth via `@supabase/ssr` cookie sessions |
| Database | Supabase Postgres with RLS |
| Storage | Supabase Storage (`hoa-documents`, `violation-evidence`) |
| Validation | Zod 4 |
| Tests | Vitest 3.2 (31 unit tests) |
| Deploy target | Vercel (`vercel.json`, Node 20 via `.nvmrc`) |

### Commands

| Purpose | Command |
|---------|---------|
| Install | `npm install` |
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Test | `npm test` |
| Verify structure | `npm run verify` |
| Smoke (HTTP) | `npm run smoke` |

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (prod) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes (prod) | Public anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Invites, org updates, admin jobs |
| `NEXT_PUBLIC_APP_URL` | Yes | Auth redirect base URL |
| `HOAFLOW_SMOKE_BASE_URL` | Optional | Smoke test target (default `http://127.0.0.1:3000`) |

---

## 2. What Works Today

- **Build pipeline:** `typecheck`, `test` (31 passing), `lint` (warnings only), `build` all pass locally.
- **Marketing:** Landing page with pricing, FAQ, contact form, help links.
- **Auth:** Login, signup + org creation, password reset, invite accept, middleware-protected `/dashboard` and `/portal`.
- **Multi-tenant DB:** 3 migrations, RLS on all tables, audit triggers, seed data for demo org.
- **Core modules:** Residents, properties, violations, architecture, inspections, documents, communications, activity, settings.
- **Operations modules:** Fines, board meetings, work orders, vendors.
- **Analytics:** Reports, calendar, global search, CSV export/import.
- **Resident portal:** Read-only views at `/portal/*`.
- **Detail pages:** Violations, residents, properties, documents, inspections, architecture, fines, meetings, work orders.
- **API:** REST routes for core entities + search + export; tenant-scoped with membership checks.
- **Demo mode:** App runs without Supabase env vars using seeded demo data.
- **CI:** GitHub Actions workflow exists.
- **Vercel:** Project linked; prior deploy failed on `npm ci` lockfile sync (fixed via `npm install` in `vercel.json`).

---

## 3. What Fails or Is Incomplete Today

| Area | Issue |
|------|-------|
| **Violation workflow** | Status enum does not match product spec (missing `draft`, `notice_sent`, `hearing_scheduled`, `appealed`). |
| **Notices** | No `violation_notices` table or UI — notices are implied via status only. |
| **Hearings** | No `violation_hearings` table — board meetings exist but are not linked to violations. |
| **Status history** | No dedicated status transition log on violation detail. |
| **Dashboard KPIs** | Missing overdue violations, scheduled hearings, outstanding fines widgets per spec. |
| **Category admin** | Categories seeded but no CRUD UI in settings. |
| **Create violation** | No evidence upload on create form (only on detail page). |
| **Action redirects** | Mutations redirect to list pages, not back to detail. |
| **Vercel deploy** | Last production deploy errored; fix committed but redeploy not confirmed. |
| **E2E tests** | No Playwright/Cypress; only HTTP smoke + unit tests. |
| **Lint** | 3 unused-import warnings (non-blocking). |

---

## 4. Missing or Broken Setup Requirements

1. Supabase migrations must be applied (`supabase db push`) before live data works.
2. Auth redirect URLs must include production domain in Supabase dashboard.
3. `SUPABASE_SERVICE_ROLE_KEY` required for invites and org settings updates.
4. User must sign up or be seeded with a `memberships` row to see live data (seed has org data but no auth users).
5. Vercel env vars must mirror `.env.example`.

---

## 5. Incomplete Features (vs. Product Goal)

- End-to-end notice creation and delivery tracking
- Violation-linked hearing scheduling
- Fine issuance from violation detail (fines module exists separately)
- Violation category management in settings
- Status workflow aligned to: draft → open → notice sent → hearing scheduled → appealed → resolved → closed
- Dashboard widgets for overdue / hearings / fines
- Browser-level E2E smoke suite

---

## 6. Security Concerns

| Severity | Finding |
|----------|---------|
| Low | Demo mode exposes UI without auth when Supabase env missing — acceptable for preview. |
| Low | Service role used for org updates — correct pattern but key must stay server-only. |
| Medium | No rate limiting on API routes (rely on Supabase/Vercel defaults). |
| Low | File uploads validate presence but not MIME/size limits in app layer (storage policies only). |
| Good | RLS enabled on all tenant tables; write policies use role checks. |
| Good | No hardcoded secrets in repo; `.env.example` uses placeholders. |

---

## 7. Deploy Blockers

| Blocker | Status |
|---------|--------|
| Production build | ✅ Passes locally |
| Lockfile sync on Vercel | ✅ Fixed (`npm install` in vercel.json) |
| Env vars on Vercel | ⚠️ Must be configured manually |
| Migrations on Supabase | ⚠️ Must be applied manually |
| Redeploy confirmation | ⚠️ Pending re-run after fix |

---

## 8. Recommended Repair Strategy

**Phase A — Domain completeness (violations focus)**  
Add migration for notices, hearings, status history; align status enum; wire detail page tabs; extend dashboard KPIs.

**Phase B — Admin & settings**  
Category CRUD in settings; notice templates as org branding defaults.

**Phase C — Quality gate**  
Fix lint warnings; expand smoke tests; add violation workflow unit tests; run dev + smoke loop.

**Phase D — Deploy**  
Push to `main`, redeploy Vercel, document env + migration steps in README and verification doc.

Prefer extending existing patterns (`RecordForm`, `DetailPage`, `requireOrgContext`, RLS) over new abstractions.
