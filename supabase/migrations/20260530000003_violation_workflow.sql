-- Violation workflow: notices, hearings, status history, expanded statuses

alter table public.violations drop constraint if exists violations_status_check;
alter table public.violations add constraint violations_status_check
  check (status in (
    'draft','open','under_review','notice_sent','warning_sent',
    'hearing_scheduled','appealed','fine_pending','resolved','closed'
  ));

create table public.violation_notices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  violation_id uuid not null references public.violations(id) on delete cascade,
  notice_type text not null default 'warning',
  delivery_method text not null default 'mail',
  delivery_status text not null default 'draft'
    check (delivery_status in ('draft','sent','delivered','failed','acknowledged')),
  subject text not null,
  body text not null,
  sent_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.violation_hearings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  violation_id uuid not null references public.violations(id) on delete cascade,
  scheduled_at timestamptz not null,
  location text,
  status text not null default 'scheduled'
    check (status in ('scheduled','completed','continued','canceled','no_show')),
  outcome_notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.violation_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  violation_id uuid not null references public.violations(id) on delete cascade,
  from_status text,
  to_status text not null,
  notes text,
  changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index on public.violation_notices (organization_id, violation_id);
create index on public.violation_hearings (organization_id, violation_id, scheduled_at);
create index on public.violation_status_history (organization_id, violation_id, created_at desc);

create trigger violation_hearings_updated before update on public.violation_hearings
  for each row execute function public.set_updated_at();

create or replace function private.log_violation_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.violation_status_history (
      organization_id, violation_id, from_status, to_status, changed_by
    ) values (
      new.organization_id, new.id, old.status, new.status, (select auth.uid())
    );
  end if;
  return new;
end;
$$;

revoke all on function private.log_violation_status_change() from public;
grant execute on function private.log_violation_status_change() to authenticated;

create trigger violation_status_history_log
  after update of status on public.violations
  for each row execute function private.log_violation_status_change();

alter table public.violation_notices enable row level security;
alter table public.violation_hearings enable row level security;
alter table public.violation_status_history enable row level security;

create policy "Tenant read violation notices" on public.violation_notices
  for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write violation notices" on public.violation_notices
  for all to authenticated using (private.can_write_org(organization_id))
  with check (private.can_write_org(organization_id));

create policy "Tenant read violation hearings" on public.violation_hearings
  for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write violation hearings" on public.violation_hearings
  for all to authenticated using (private.can_write_org(organization_id))
  with check (private.can_write_org(organization_id));

create policy "Tenant read violation status history" on public.violation_status_history
  for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant append violation status history" on public.violation_status_history
  for insert to authenticated with check (private.can_write_org(organization_id));

create trigger audit_violation_notices after insert or update or delete on public.violation_notices
  for each row execute function private.log_tenant_activity();
create trigger audit_violation_hearings after insert or update or delete on public.violation_hearings
  for each row execute function private.log_tenant_activity();
create trigger audit_violation_status_history after insert or update or delete on public.violation_status_history
  for each row execute function private.log_tenant_activity();
