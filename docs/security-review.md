# HOAFlow Security Review

**Review date:** 2026-05-30  
**Scope:** Auth, RLS, server actions, API routes, env handling, file uploads, demo mode

---

## Issues Found

| Severity | Area | Issue |
|----------|------|-------|
| High | Demo mode | Dashboard shell and organization service called `createClient()` without checking Supabase env, causing 500 errors instead of demo fallback. |
| Medium | Type safety | `database.ts` was missing types for `violation_notices`, `violation_hearings`, and expanded violation statuses, weakening compile-time guarantees on workflow queries. |
| Medium | Middleware | When Supabase env is absent, `/dashboard` and `/portal` are not auth-protected (intentional preview mode, but routes are publicly browsable). |
| Low | Service role | Admin actions (invites, org settings, notification prefs) require `SUPABASE_SERVICE_ROLE_KEY`; missing key fails with user-facing redirect rather than silent success. |
| Low | API routes | Tenant API returns 503 when env is missing; does not distinguish unauthenticated vs misconfigured in all cases. |
| Info | Storage | Upload paths must be org-prefixed; policies enforce membership from first path segment. |

---

## What Was Fixed

1. **Demo mode hardening** — `getCurrentMemberships()`, `getOrganizationContext()`, and `DashboardShell` now guard with `hasSupabasePublicEnv()` before creating a Supabase client. Dashboard pages render demo data without credentials.
2. **Violation workflow schema** — Migration `20260530000003_violation_workflow.sql` adds notices, hearings, status history tables with RLS, audit triggers, and expanded status constraint.
3. **Type definitions** — `src/types/database.ts` updated with new tables and full violation status union.
4. **Server action authorization** — All mutation actions use `requireOrgContext()` + `requireWritePermission()`; read-only roles cannot mutate records.
5. **Input validation** — Zod schemas validate violation, notice, hearing, and category payloads before database writes.
6. **Status history** — Database trigger logs status transitions; prevents client-side-only audit gaps.
7. **Seed data** — Sample notice and hearing records added for the demo violation.
8. **Lint / build hygiene** — Removed unused dashboard queries; zero ESLint warnings.

---

## Security Controls in Place

| Control | Implementation |
|---------|----------------|
| Authentication | Supabase cookie sessions; middleware redirects unauthenticated users on protected routes when env is configured |
| Authorization | Role-based permissions in `src/lib/permissions.ts`; enforced in server actions |
| Tenant isolation | Postgres RLS on all public tables; `organization_id` scoping |
| Audit logging | `activity_logs` + per-table audit triggers |
| Storage | Private buckets; org-scoped path policies |
| Secrets | `.env.example` uses placeholders; service role never exposed to client bundles |
| HTTP headers | Security headers verified in smoke tests (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) |
| API protection | Unauthenticated requests to tenant API routes return 401/403/503 JSON errors |

---

## Remaining Risks

| Risk | Mitigation / Notes |
|------|-------------------|
| **Preview mode exposure** | Without Supabase env, dashboard is publicly viewable with demo data only — acceptable for local review; never deploy without env vars. |
| **No rate limiting** | Auth and API routes rely on Supabase/Vercel defaults; add edge rate limiting for production hardening if needed. |
| **No CAPTCHA on signup** | Standard for internal HOA tools; add if exposing public self-service signup. |
| **File upload size/type** | Client-side file inputs; consider server-side MIME validation and size caps before production scale. |
| **E2E security tests** | HTTP smoke + unit tests only; no automated auth/session regression suite yet. |
| **Service role in Vercel** | Required for invites and org admin; restrict to server runtime only and rotate on schedule. |

---

## Pre-Deploy Checklist

- [ ] All four migrations applied (`supabase db push`)
- [ ] RLS enabled on new workflow tables (included in migration)
- [ ] Supabase Auth redirect URLs configured for production domain
- [ ] All four env vars set in Vercel (never commit real keys)
- [ ] Storage buckets exist and policies active
- [ ] `npm run smoke` passes against production URL
- [ ] Confirm dashboard requires login in production (env vars present → middleware active)
