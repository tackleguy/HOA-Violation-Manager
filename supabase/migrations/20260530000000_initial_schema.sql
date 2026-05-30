create extension if not exists "pgcrypto";

create type public.app_role as enum ('super_admin','hoa_admin','board_member','community_manager','inspector','read_only');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'professional',
  branding jsonb not null default '{}'::jsonb,
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null default 'read_only',
  status text not null default 'active' check (status in ('invited','active','suspended')),
  invited_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.residents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  address text not null,
  parcel_number text,
  section text,
  status text not null default 'clear',
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_owners (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  resident_id uuid not null references public.residents(id) on delete cascade,
  owner_type text not null default 'owner',
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table public.violation_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  default_severity text not null default 'medium',
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.violations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  resident_id uuid references public.residents(id) on delete set null,
  category_id uuid references public.violation_categories(id) on delete set null,
  description text not null,
  status text not null default 'open' check (status in ('open','under_review','warning_sent','fine_pending','resolved','closed')),
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  due_date date,
  resolved_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.violation_photos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  violation_id uuid not null references public.violations(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.violation_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  violation_id uuid not null references public.violations(id) on delete cascade,
  body text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.architectural_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  resident_id uuid references public.residents(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'submitted' check (status in ('submitted','under_review','board_review','approved','rejected')),
  decision_notes text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.architectural_request_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  request_id uuid not null references public.architectural_requests(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create table public.inspection_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  checklist jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  template_id uuid references public.inspection_templates(id) on delete set null,
  title text not null,
  scheduled_for timestamptz,
  assigned_to uuid references public.profiles(id),
  status text not null default 'scheduled' check (status in ('scheduled','in_progress','completed','canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inspection_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  findings jsonb not null default '[]'::jsonb,
  notes text,
  recommendations text,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  category text not null,
  visibility text not null default 'residents',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  version_label text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  body text not null,
  audience text not null default 'all',
  published_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on public.memberships (user_id, organization_id);
create index on public.residents (organization_id, last_name);
create index on public.properties (organization_id, status);
create index on public.violations (organization_id, status, due_date);
create index on public.activity_logs (organization_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_updated before update on public.organizations for each row execute function public.set_updated_at();
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger memberships_updated before update on public.memberships for each row execute function public.set_updated_at();
create trigger residents_updated before update on public.residents for each row execute function public.set_updated_at();
create trigger properties_updated before update on public.properties for each row execute function public.set_updated_at();
create trigger violations_updated before update on public.violations for each row execute function public.set_updated_at();
create trigger architectural_requests_updated before update on public.architectural_requests for each row execute function public.set_updated_at();
create trigger inspections_updated before update on public.inspections for each row execute function public.set_updated_at();
create trigger documents_updated before update on public.documents for each row execute function public.set_updated_at();

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      updated_at = now();

  return new;
end;
$$;

create trigger auth_users_profile_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where memberships.organization_id = org_id
      and memberships.user_id = (select auth.uid())
      and memberships.status = 'active'
  );
$$;

create or replace function private.can_write_org(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where memberships.organization_id = org_id
      and memberships.user_id = (select auth.uid())
      and memberships.status = 'active'
      and memberships.role in ('super_admin','hoa_admin','board_member','community_manager','inspector')
  );
$$;

create or replace function private.can_manage_org(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where memberships.organization_id = org_id
      and memberships.user_id = (select auth.uid())
      and memberships.status = 'active'
      and memberships.role in ('super_admin','hoa_admin')
  );
$$;

create or replace function private.log_tenant_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_org_id uuid;
  row_target_id uuid;
begin
  if tg_op = 'DELETE' then
    row_org_id := old.organization_id;
    row_target_id := old.id;
  else
    row_org_id := new.organization_id;
    row_target_id := new.id;
  end if;

  if row_org_id is not null then
    insert into public.activity_logs (
      organization_id,
      actor_id,
      action,
      target_table,
      target_id,
      metadata
    )
    values (
      row_org_id,
      (select auth.uid()),
      'db.' || tg_table_name || '.' || lower(tg_op),
      tg_table_name,
      row_target_id,
      jsonb_build_object('operation', tg_op)
    );
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;
revoke all on function private.is_org_member(uuid) from public;
revoke all on function private.can_write_org(uuid) from public;
revoke all on function private.can_manage_org(uuid) from public;
revoke all on function private.log_tenant_activity() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.can_write_org(uuid) to authenticated;
grant execute on function private.can_manage_org(uuid) to authenticated;

create trigger audit_memberships after insert or update or delete on public.memberships for each row execute function private.log_tenant_activity();
create trigger audit_residents after insert or update or delete on public.residents for each row execute function private.log_tenant_activity();
create trigger audit_properties after insert or update or delete on public.properties for each row execute function private.log_tenant_activity();
create trigger audit_property_owners after insert or update or delete on public.property_owners for each row execute function private.log_tenant_activity();
create trigger audit_violation_categories after insert or update or delete on public.violation_categories for each row execute function private.log_tenant_activity();
create trigger audit_violations after insert or update or delete on public.violations for each row execute function private.log_tenant_activity();
create trigger audit_violation_photos after insert or update or delete on public.violation_photos for each row execute function private.log_tenant_activity();
create trigger audit_violation_comments after insert or update or delete on public.violation_comments for each row execute function private.log_tenant_activity();
create trigger audit_architectural_requests after insert or update or delete on public.architectural_requests for each row execute function private.log_tenant_activity();
create trigger audit_architectural_request_files after insert or update or delete on public.architectural_request_files for each row execute function private.log_tenant_activity();
create trigger audit_inspection_templates after insert or update or delete on public.inspection_templates for each row execute function private.log_tenant_activity();
create trigger audit_inspections after insert or update or delete on public.inspections for each row execute function private.log_tenant_activity();
create trigger audit_inspection_reports after insert or update or delete on public.inspection_reports for each row execute function private.log_tenant_activity();
create trigger audit_documents after insert or update or delete on public.documents for each row execute function private.log_tenant_activity();
create trigger audit_document_versions after insert or update or delete on public.document_versions for each row execute function private.log_tenant_activity();
create trigger audit_announcements after insert or update or delete on public.announcements for each row execute function private.log_tenant_activity();
create trigger audit_notifications after insert or update or delete on public.notifications for each row execute function private.log_tenant_activity();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.residents enable row level security;
alter table public.properties enable row level security;
alter table public.property_owners enable row level security;
alter table public.violation_categories enable row level security;
alter table public.violations enable row level security;
alter table public.violation_photos enable row level security;
alter table public.violation_comments enable row level security;
alter table public.architectural_requests enable row level security;
alter table public.architectural_request_files enable row level security;
alter table public.inspection_templates enable row level security;
alter table public.inspections enable row level security;
alter table public.inspection_reports enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

create policy "Profiles are visible to self" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Profiles can update self" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Memberships visible to members" on public.memberships for select to authenticated using (private.is_org_member(organization_id));
create policy "Memberships managed by HOA admins" on public.memberships for all to authenticated using (private.can_manage_org(organization_id)) with check (private.can_manage_org(organization_id));
create policy "Organizations visible to members" on public.organizations for select to authenticated using (private.is_org_member(id));

create policy "Tenant read residents" on public.residents for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write residents" on public.residents for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read properties" on public.properties for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write properties" on public.properties for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read property owners" on public.property_owners for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write property owners" on public.property_owners for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read categories" on public.violation_categories for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write categories" on public.violation_categories for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read violations" on public.violations for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write violations" on public.violations for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read violation photos" on public.violation_photos for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write violation photos" on public.violation_photos for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read violation comments" on public.violation_comments for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write violation comments" on public.violation_comments for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read architectural requests" on public.architectural_requests for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write architectural requests" on public.architectural_requests for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read architectural files" on public.architectural_request_files for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write architectural files" on public.architectural_request_files for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read inspection templates" on public.inspection_templates for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write inspection templates" on public.inspection_templates for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read inspections" on public.inspections for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write inspections" on public.inspections for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read inspection reports" on public.inspection_reports for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write inspection reports" on public.inspection_reports for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read documents" on public.documents for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write documents" on public.documents for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read document versions" on public.document_versions for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write document versions" on public.document_versions for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Tenant read announcements" on public.announcements for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write announcements" on public.announcements for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
create policy "Users read own notifications" on public.notifications for select to authenticated using ((select auth.uid()) = user_id and private.is_org_member(organization_id));
create policy "Users update own notifications" on public.notifications for update to authenticated using ((select auth.uid()) = user_id and private.is_org_member(organization_id)) with check ((select auth.uid()) = user_id and private.is_org_member(organization_id));
create policy "Tenant read activity logs" on public.activity_logs for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant append activity logs" on public.activity_logs for insert to authenticated with check (private.can_write_org(organization_id));

insert into storage.buckets (id, name, public) values ('hoa-documents', 'hoa-documents', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('violation-evidence', 'violation-evidence', false) on conflict (id) do nothing;

create policy "Members read tenant files" on storage.objects for select to authenticated
using (bucket_id in ('hoa-documents','violation-evidence') and private.is_org_member((storage.foldername(name))[1]::uuid));

create policy "Writers upload tenant files" on storage.objects for insert to authenticated
with check (bucket_id in ('hoa-documents','violation-evidence') and private.can_write_org((storage.foldername(name))[1]::uuid));

create policy "Writers update tenant files" on storage.objects for update to authenticated
using (bucket_id in ('hoa-documents','violation-evidence') and private.can_write_org((storage.foldername(name))[1]::uuid))
with check (bucket_id in ('hoa-documents','violation-evidence') and private.can_write_org((storage.foldername(name))[1]::uuid));
