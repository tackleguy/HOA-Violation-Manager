# HOA Violation Manager — Rebuild / Repair Plan

Actionable execution plan to reach production-ready deploy state.

---

## Phase 1 — Violation Domain (Priority 1)

### Migration
**File:** `supabase/migrations/20260530000003_violation_workflow.sql`

- Add `violation_notices`, `violation_hearings`, `violation_status_history` tables
- Extend `violations.status` check constraint for full workflow
- RLS + audit triggers matching existing pattern
- Trigger to log status changes into `violation_status_history`
- Seed sample notice + hearing for demo violation

### Constants & validation
**Files:**
- `src/lib/violation-workflow.ts` — status lists, labels, active/overdue helpers
- `src/lib/validation/schemas.ts` — extend `violationStatusSchema`, add notice/hearing schemas
- `src/components/ui/status-badge.tsx` — map new statuses

### Services
**Files:**
- `src/lib/services/violation-workflow-service.ts` — notices, hearings, status history, linked fines
- `src/lib/services/dashboard-service.ts` — overdue, hearings, outstanding fines KPIs
- `src/lib/demo-data.ts` — updated demo metrics

### Actions
**File:** `src/lib/actions/violations.ts`
- `createViolationNotice`, `createViolationHearing`
- `updateViolationStatus` — write status history + optional auto-transition

### UI
**Files:**
- `src/app/dashboard/violations/[id]/page.tsx` — tabs: Notices, Hearings, Fines, Status history
- `src/app/dashboard/violations/page.tsx` — full status filter options
- `src/app/dashboard/page.tsx` — KPI grid with overdue/hearings/fines

---

## Phase 2 — Settings & Categories (Priority 2)

**Files:**
- `src/lib/actions/categories.ts` — create/update/delete violation categories
- `src/app/dashboard/settings/page.tsx` — category management form
- `src/lib/actions/index.ts` — export categories actions

---

## Phase 3 — Quality & Smoke (Priority 3)

**Files:**
- Fix lint warnings in `fines/page.tsx`, `export-service.ts`, `meetings-service.ts`
- `src/__tests__/violation-workflow.test.ts` — status helpers
- `scripts/smoke-test.mjs` — add `/dashboard/violations`, `/help`, `/api/health` routes
- `scripts/verify-project.mjs` — include new migration snippets

---

## Phase 4 — Documentation & Deploy (Priority 4)

**Files:**
- `docs/security-review.md`
- `docs/verification.md`
- `README.md` — full run/deploy guide
- `.env.example` — confirm completeness

### Deploy steps
1. `git push origin main`
2. `npx vercel --prod`
3. Set Vercel env vars
4. `supabase db push` on linked project
5. Configure Supabase Auth redirect URLs

---

## Test Plan

| Test | Method |
|------|--------|
| Unit | `npm test` — permissions, schemas, csv, currency, format, violation-workflow |
| Static | `npm run typecheck && npm run lint` |
| Build | `npm run build` |
| Structure | `npm run verify` |
| HTTP smoke | `npm run dev` + `npm run smoke` |
| Manual | Dashboard KPIs, violation list, create, detail tabs, status change |

---

## Release Readiness Checklist

- [ ] All migrations applied to Supabase
- [ ] Env vars documented and set on Vercel
- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] Smoke tests pass against running dev server
- [ ] Violation create → detail → notice → hearing → status change works
- [ ] Dashboard shows overdue/hearings/fines
- [ ] No critical lint errors
- [ ] README + verification docs updated
- [ ] Vercel production deploy green
