# HOAFlow Deployment Runbook

## Preflight

Run these checks before deploying:

```bash
npm ci
npm run verify
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

The GitHub Actions workflow in `.github/workflows/ci.yml` runs the same verification gates on pushes to `main` and on pull requests.

## Supabase

1. Link the project:

```bash
supabase link --project-ref ckussqxgvuclnkrgwzaz
```

2. Apply migrations:

```bash
supabase db push
```

3. Seed demo operating data when needed:

```bash
supabase db seed
```

4. Confirm storage buckets exist:

- `hoa-documents`
- `violation-evidence`

5. Confirm RLS is enabled on every public table and storage object policies are active.

6. Confirm database triggers exist:

- `auth_users_profile_created`
- `audit_*` triggers on tenant tables

## Vercel

Set these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

Configure Supabase Auth redirect URLs for:

- `https://your-production-domain.com/dashboard`
- `https://your-production-domain.com/auth/callback`
- `https://your-production-domain.com/invite`
- `https://your-production-domain.com/reset-password`
- `https://your-production-domain.com/update-password`

## Smoke Tests

After deploy:

```bash
curl https://your-production-domain.com/api/health
```

With a local or deployed server running, execute:

```bash
HOAFLOW_SMOKE_BASE_URL=https://your-production-domain.com npm run smoke
```

Then test:

- Email/password sign-in
- Magic link sign-in
- Password reset
- Password update from recovery link
- User invitation
- Resident creation
- Property creation
- Violation creation
- Document upload
- Violation evidence upload
- API unauthenticated requests return `401`
