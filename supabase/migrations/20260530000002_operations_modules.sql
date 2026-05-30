create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  category text,
  email text,
  phone text,
  notes text,
  status text not null default 'active'
);

create table public.board_meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  meeting_type text not null default 'regular',
  scheduled_at timestamptz not null,
  location text,
  status text not null default 'scheduled',
  agenda_summary text,
  minutes_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meeting_agenda_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  meeting_id uuid not null references public.board_meetings(id) on delete cascade,
  sort_order int not null default 0,
  title text not null,
  description text,
  presenter text,
  duration_minutes int
);

create table public.fines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  violation_id uuid references public.violations(id) on delete set null,
  property_id uuid not null references public.properties(id) on delete cascade,
  resident_id uuid references public.residents(id) on delete set null,
  amount_cents int not null check (amount_cents > 0),
  description text not null,
  status text not null default 'issued' check (status in ('issued','paid','waived','overdue')),
  due_date date,
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  created_by uuid references public.profiles(id)
);

create table public.fine_payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  fine_id uuid not null references public.fines(id) on delete cascade,
  amount_cents int not null check (amount_cents > 0),
  payment_method text not null,
  reference_number text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  title text not null,
  description text,
  category text not null default 'maintenance',
  priority text not null default 'medium',
  status text not null default 'open' check (status in ('open','assigned','in_progress','completed','canceled')),
  assigned_to uuid references public.profiles(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  due_date date,
  completed_at timestamptz,
  created_by uuid references public.profiles(id)
);

create table public.work_order_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  body text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index vendors_org_status_idx on public.vendors (organization_id, status);
create index board_meetings_org_scheduled_idx on public.board_meetings (organization_id, scheduled_at desc);
create index board_meetings_org_status_idx on public.board_meetings (organization_id, status);
create index meeting_agenda_items_meeting_sort_idx on public.meeting_agenda_items (meeting_id, sort_order);
create index fines_org_status_due_idx on public.fines (organization_id, status, due_date);
create index fines_violation_idx on public.fines (violation_id);
create index fines_property_idx on public.fines (property_id);
create index fine_payments_fine_idx on public.fine_payments (fine_id);
create index work_orders_org_status_priority_idx on public.work_orders (organization_id, status, priority);
create index work_orders_vendor_idx on public.work_orders (vendor_id);
create index work_orders_property_idx on public.work_orders (property_id);
create index work_order_comments_work_order_idx on public.work_order_comments (work_order_id, created_at desc);

create trigger board_meetings_updated
before update on public.board_meetings
for each row execute function public.set_updated_at();

create trigger audit_vendors after insert or update or delete on public.vendors for each row execute function private.log_tenant_activity();
create trigger audit_board_meetings after insert or update or delete on public.board_meetings for each row execute function private.log_tenant_activity();
create trigger audit_meeting_agenda_items after insert or update or delete on public.meeting_agenda_items for each row execute function private.log_tenant_activity();
create trigger audit_fines after insert or update or delete on public.fines for each row execute function private.log_tenant_activity();
create trigger audit_fine_payments after insert or update or delete on public.fine_payments for each row execute function private.log_tenant_activity();
create trigger audit_work_orders after insert or update or delete on public.work_orders for each row execute function private.log_tenant_activity();
create trigger audit_work_order_comments after insert or update or delete on public.work_order_comments for each row execute function private.log_tenant_activity();

alter table public.vendors enable row level security;
alter table public.board_meetings enable row level security;
alter table public.meeting_agenda_items enable row level security;
alter table public.fines enable row level security;
alter table public.fine_payments enable row level security;
alter table public.work_orders enable row level security;
alter table public.work_order_comments enable row level security;

create policy "Tenant read vendors" on public.vendors for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write vendors" on public.vendors for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));

create policy "Tenant read board meetings" on public.board_meetings for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write board meetings" on public.board_meetings for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));

create policy "Tenant read meeting agenda items" on public.meeting_agenda_items for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write meeting agenda items" on public.meeting_agenda_items for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));

create policy "Tenant read fines" on public.fines for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write fines" on public.fines for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));

create policy "Tenant read fine payments" on public.fine_payments for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write fine payments" on public.fine_payments for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));

create policy "Tenant read work orders" on public.work_orders for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write work orders" on public.work_orders for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));

create policy "Tenant read work order comments" on public.work_order_comments for select to authenticated using (private.is_org_member(organization_id));
create policy "Tenant write work order comments" on public.work_order_comments for all to authenticated using (private.can_write_org(organization_id)) with check (private.can_write_org(organization_id));
