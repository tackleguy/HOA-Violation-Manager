import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  ".github/workflows/ci.yml",
  "src/app/page.tsx",
  "src/app/auth/callback/route.ts",
  "src/app/(auth)/update-password/page.tsx",
  "src/app/dashboard/page.tsx",
  "src/lib/env.ts",
  "src/lib/api/tenant-api.ts",
  "supabase/migrations/20260530000000_initial_schema.sql",
  "supabase/seed.sql",
  ".env.example",
  "vercel.json",
  "docs/api.md",
  "docs/deployment.md",
  "README.md"
];

const requiredMigrationSnippets = [
  "alter table public.organizations enable row level security",
  "alter table public.activity_logs enable row level security",
  "create policy \"Tenant append activity logs\"",
  "insert into storage.buckets",
  "private.handle_new_user",
  "private.is_org_member",
  "private.can_write_org",
  "private.log_tenant_activity"
];

const policyExemptTables = new Set(["profiles", "organizations", "memberships", "notifications", "activity_logs"]);

const requiredAuditTables = [
  "memberships",
  "residents",
  "properties",
  "property_owners",
  "violation_categories",
  "violations",
  "violation_photos",
  "violation_comments",
  "architectural_requests",
  "architectural_request_files",
  "inspection_templates",
  "inspections",
  "inspection_reports",
  "documents",
  "document_versions",
  "announcements",
  "notifications"
];

const requiredApiRoutes = [
  "src/app/api/residents/route.ts",
  "src/app/api/properties/route.ts",
  "src/app/api/violations/route.ts",
  "src/app/api/documents/route.ts",
  "src/app/api/architectural-requests/route.ts",
  "src/app/api/inspections/route.ts",
  "src/app/api/activity/route.ts"
];

const failures = [];

for (const file of [...requiredFiles, ...requiredApiRoutes]) {
  if (!existsSync(file)) failures.push(`Missing required file: ${file}`);
}

if (existsSync("supabase/migrations/20260530000000_initial_schema.sql")) {
  const migration = readFileSync("supabase/migrations/20260530000000_initial_schema.sql", "utf8");
  for (const snippet of requiredMigrationSnippets) {
    if (!migration.includes(snippet)) failures.push(`Migration missing snippet: ${snippet}`);
  }

  const tables = [...migration.matchAll(/create table public\.([a-z_]+)/g)].map((match) => match[1]);
  for (const table of tables) {
    if (!migration.includes(`alter table public.${table} enable row level security`)) {
      failures.push(`RLS is not enabled for table: ${table}`);
    }

    const hasPolicy = new RegExp(`create policy "[^"]+" on public\\.${table}\\b`).test(migration);
    if (!hasPolicy) {
      failures.push(`No RLS policy found for table: ${table}`);
    }

    if (!policyExemptTables.has(table) && !migration.includes(`private.is_org_member(organization_id)`)) {
      failures.push(`Tenant read helper missing from migration for tenant tables.`);
    }
  }

  const tenantTables = tables.filter((table) => !policyExemptTables.has(table));
  for (const table of tenantTables) {
    const tablePolicyText = migration
      .split("\n")
      .filter((line) => line.includes(` on public.${table} `))
      .join("\n");

    if (!tablePolicyText.includes("private.is_org_member(organization_id)")) {
      failures.push(`Tenant table missing member read policy: ${table}`);
    }

    if (!tablePolicyText.includes("private.can_write_org(organization_id)") && !table.endsWith("_logs")) {
      failures.push(`Tenant table missing write policy: ${table}`);
    }
  }

  if (!migration.includes("create trigger auth_users_profile_created")) {
    failures.push("Missing auth.users profile bootstrap trigger.");
  }

  for (const table of requiredAuditTables) {
    if (!migration.includes(`create trigger audit_${table} after insert or update or delete on public.${table}`)) {
      failures.push(`Missing audit trigger for table: ${table}`);
    }
  }
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
for (const script of ["build", "typecheck", "lint", "verify", "smoke"]) {
  if (!packageJson.scripts?.[script]) failures.push(`package.json missing script: ${script}`);
}

const envExample = readFileSync(".env.example", "utf8");
for (const envName of [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL"
]) {
  if (!envExample.includes(envName)) failures.push(`.env.example missing variable: ${envName}`);
}

const deploymentDoc = readFileSync("docs/deployment.md", "utf8");
for (const deploymentSnippet of ["npm run verify", "supabase db push", "Vercel", "Smoke Tests"]) {
  if (!deploymentDoc.includes(deploymentSnippet)) {
    failures.push(`Deployment docs missing: ${deploymentSnippet}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("HOAFlow project verification passed.");
