create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  email_enabled boolean not null default true,
  in_app_enabled boolean not null default true,
  digest_frequency text not null default 'daily' check (digest_frequency in ('immediate','daily','weekly','off')),
  channels jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index notification_preferences_user_idx on public.notification_preferences (user_id, organization_id);

create trigger notification_preferences_updated
before update on public.notification_preferences
for each row execute function public.set_updated_at();

create or replace function private.create_organization(org_name text, org_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required to create an organization.';
  end if;

  if org_name is null or btrim(org_name) = '' then
    raise exception 'Organization name is required.';
  end if;

  if org_slug is null or btrim(org_slug) = '' then
    raise exception 'Organization slug is required.';
  end if;

  insert into public.organizations (name, slug)
  values (btrim(org_name), btrim(org_slug))
  returning id into org_id;

  insert into public.memberships (organization_id, user_id, role, status)
  values (org_id, current_user_id, 'hoa_admin', 'active');

  insert into public.notification_preferences (organization_id, user_id)
  values (org_id, current_user_id)
  on conflict (organization_id, user_id) do nothing;

  return org_id;
end;
$$;

create or replace function public.create_organization(org_name text, org_slug text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select private.create_organization(org_name, org_slug);
$$;

revoke all on function private.create_organization(text, text) from public;
revoke all on function public.create_organization(text, text) from public;
grant execute on function private.create_organization(text, text) to authenticated;
grant execute on function public.create_organization(text, text) to authenticated;

create policy "Organizations updated by admins" on public.organizations
for update to authenticated
using (private.can_manage_org(id))
with check (private.can_manage_org(id));

create policy "Users activate own invite" on public.memberships
for update to authenticated
using ((select auth.uid()) = user_id and status = 'invited')
with check ((select auth.uid()) = user_id and status = 'active');

create policy "Users manage own notification preferences" on public.notification_preferences
for all to authenticated
using ((select auth.uid()) = user_id and private.is_org_member(organization_id))
with check ((select auth.uid()) = user_id and private.is_org_member(organization_id));

create policy "System insert notifications" on public.notifications
for insert to authenticated
with check (private.can_manage_org(organization_id));

alter table public.notification_preferences enable row level security;

insert into storage.buckets (id, name, public)
values ('architectural-files', 'architectural-files', false)
on conflict (id) do nothing;

create policy "Members read architectural files" on storage.objects
for select to authenticated
using (
  bucket_id = 'architectural-files'
  and private.is_org_member((storage.foldername(name))[1]::uuid)
);

create policy "Writers upload architectural files" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'architectural-files'
  and private.can_write_org((storage.foldername(name))[1]::uuid)
);

create policy "Writers update architectural files" on storage.objects
for update to authenticated
using (
  bucket_id = 'architectural-files'
  and private.can_write_org((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'architectural-files'
  and private.can_write_org((storage.foldername(name))[1]::uuid)
);

create policy "Writers delete architectural files" on storage.objects
for delete to authenticated
using (
  bucket_id = 'architectural-files'
  and private.can_write_org((storage.foldername(name))[1]::uuid)
);
