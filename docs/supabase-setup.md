# Supabase setup (HOAFlow)

## 1. Environment variables

Copy `.env.example` to `.env.local` and fill in keys from [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/ckussqxgvuclnkrgwzaz/settings/api):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server auth (publishable or legacy anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional: invites and admin-only signup fallback |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally; production URL on Vercel |

Set the same variables in **Vercel → Project → Settings → Environment Variables**.

## 2. Auth redirect URLs

In **Authentication → URL configuration**, add:

- `http://localhost:3000/auth/callback`
- `https://<your-vercel-domain>/auth/callback`

Set **Site URL** to your primary app URL.

For local email signup without extra steps, you can disable **Confirm email** under Authentication → Providers → Email (recommended for development only).

## 3. Database migrations

Migrations live in `supabase/migrations/`. Apply to the linked project with:

- **Cursor MCP** (recommended): Supabase MCP `apply_migration` / `list_migrations`
- **Supabase CLI**: `npx supabase link` then `npx supabase db push`

After migrations, `public` should include `organizations`, `profiles`, `memberships`, `violations`, etc.

## 4. Sign up flow

1. User signs up at `/signup` with HOA name.
2. Pending org name/slug is stored in `user_metadata`.
3. On first sign-in (password, magic link, or email confirmation callback), `create_organization` RPC provisions the workspace and membership.
4. Org cookie is set; dashboard loads tenant data.

## 5. Verify

```bash
npm run dev
```

1. Create account at `/signup` or sign in at `/login`
2. Dashboard should show your organization name (not "Demo HOA Workspace")
3. Create a resident or violation — refresh — record persists

## 6. Optional seed data

Run `supabase/seed.sql` in the SQL editor after at least one organization exists, or adjust org IDs in the seed file to match your workspace.
