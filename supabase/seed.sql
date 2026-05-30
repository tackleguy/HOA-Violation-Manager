insert into public.organizations (id, name, slug, plan, contact_email, contact_phone)
values ('00000000-0000-4000-8000-000000000001', 'Evergreen Ridge HOA', 'evergreen-ridge', 'professional', 'board@evergreenridge.test', '555-0100')
on conflict (slug) do nothing;

insert into public.residents (id, organization_id, first_name, last_name, email, phone, notes)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'Marisol', 'Bennett', 'marisol@example.com', '555-0101', 'Board communications preference: email'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'Owen', 'Palmer', 'owen@example.com', '555-0102', 'Tenant record linked to Lake Vista property'),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'Nadia', 'Shah', 'nadia@example.com', '555-0103', 'Architectural committee member')
on conflict (id) do nothing;

insert into public.properties (id, organization_id, address, parcel_number, section, status, latitude, longitude)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', '1844 Cypress Bend', 'CB-1844', 'Cypress', 'clear', 33.6412210, -117.8379910),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001', '9013 Lake Vista', 'LV-9013', 'Lakeside', 'violation', 33.6425810, -117.8391200),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000001', '77 Stonebridge', 'SB-0077', 'Stonebridge', 'review', 33.6409820, -117.8364410)
on conflict (id) do nothing;

insert into public.property_owners (organization_id, property_id, resident_id, owner_type, start_date)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'owner', '2020-03-15'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', 'tenant', '2023-08-01'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000103', 'owner', '2019-11-20')
on conflict do nothing;

insert into public.violation_categories (organization_id, name, default_severity)
values
  ('00000000-0000-4000-8000-000000000001', 'Landscaping', 'medium'),
  ('00000000-0000-4000-8000-000000000001', 'Parking', 'medium'),
  ('00000000-0000-4000-8000-000000000001', 'Trash bins', 'low'),
  ('00000000-0000-4000-8000-000000000001', 'Exterior maintenance', 'high'),
  ('00000000-0000-4000-8000-000000000001', 'Noise complaints', 'medium'),
  ('00000000-0000-4000-8000-000000000001', 'Pet violations', 'medium')
on conflict do nothing;

insert into public.violations (organization_id, property_id, resident_id, description, status, severity, due_date)
select
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000202',
  '00000000-0000-4000-8000-000000000102',
  'Trash bins visible from street on collection day.',
  'open',
  'medium',
  current_date + interval '14 days'
where not exists (
  select 1 from public.violations
  where organization_id = '00000000-0000-4000-8000-000000000001'
    and property_id = '00000000-0000-4000-8000-000000000202'
    and description = 'Trash bins visible from street on collection day.'
);

insert into public.architectural_requests (organization_id, property_id, resident_id, title, description, status)
select
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000103',
  'Front patio pergola',
  'Request to install a cedar pergola on the front patio.',
  'under_review'
where not exists (
  select 1 from public.architectural_requests
  where organization_id = '00000000-0000-4000-8000-000000000001'
    and title = 'Front patio pergola'
);

insert into public.inspections (organization_id, title, scheduled_for, status)
select
  '00000000-0000-4000-8000-000000000001',
  'North gate safety walk',
  now() + interval '7 days',
  'scheduled'
where not exists (
  select 1 from public.inspections
  where organization_id = '00000000-0000-4000-8000-000000000001'
    and title = 'North gate safety walk'
);

insert into public.documents (organization_id, name, category, visibility)
values
  ('00000000-0000-4000-8000-000000000001', 'CC&Rs', 'CC&Rs', 'residents'),
  ('00000000-0000-4000-8000-000000000001', 'Community Rules', 'Community Rules', 'residents'),
  ('00000000-0000-4000-8000-000000000001', 'Board Minutes - May', 'Meeting Minutes', 'board')
on conflict do nothing;

insert into public.announcements (organization_id, title, body, audience, published_at)
select
  '00000000-0000-4000-8000-000000000001',
  'Pool maintenance scheduled',
  'The community pool will close for maintenance on June 8 from 8 AM to 4 PM.',
  'all',
  now() - interval '2 days'
where not exists (
  select 1 from public.announcements
  where organization_id = '00000000-0000-4000-8000-000000000001'
    and title = 'Pool maintenance scheduled'
);

insert into public.activity_logs (organization_id, action, target_table, metadata)
values
  ('00000000-0000-4000-8000-000000000001', 'workspace.seeded', 'organizations', '{"source":"seed.sql"}'),
  ('00000000-0000-4000-8000-000000000001', 'document.created', 'documents', '{"name":"CC&Rs"}'),
  ('00000000-0000-4000-8000-000000000001', 'inspection.scheduled', 'inspections', '{"section":"North gate"}')
on conflict do nothing;

insert into public.vendors (id, organization_id, name, category, email, phone, status)
values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', 'GreenScape Landscaping', 'landscaping', 'service@greenscape.test', '555-0201', 'active'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000001', 'Summit Plumbing Co.', 'plumbing', 'dispatch@summitplumbing.test', '555-0202', 'active')
on conflict (id) do nothing;

insert into public.board_meetings (id, organization_id, title, meeting_type, scheduled_at, location, status, agenda_summary)
values
  (
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000001',
    'June Board Meeting',
    'regular',
    now() + interval '14 days',
    'Community clubhouse',
    'scheduled',
    'Budget review, architectural requests, and pool maintenance update.'
  )
on conflict (id) do nothing;

insert into public.meeting_agenda_items (organization_id, meeting_id, sort_order, title, description, presenter, duration_minutes)
values
  (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000401',
    0,
    'Call to order',
    'Roll call and approval of prior minutes.',
    'Board President',
    10
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000401',
    1,
    'Budget review',
    'Review reserve fund contributions and upcoming capital projects.',
    'Treasurer',
    30
  )
on conflict do nothing;

insert into public.fines (organization_id, violation_id, property_id, resident_id, amount_cents, description, status, due_date)
select
  '00000000-0000-4000-8000-000000000001',
  v.id,
  '00000000-0000-4000-8000-000000000202',
  '00000000-0000-4000-8000-000000000102',
  7500,
  'Fine for trash bins visible from street on collection day.',
  'issued',
  current_date + interval '30 days'
from public.violations v
where v.organization_id = '00000000-0000-4000-8000-000000000001'
  and v.property_id = '00000000-0000-4000-8000-000000000202'
  and not exists (
    select 1 from public.fines f
    where f.organization_id = '00000000-0000-4000-8000-000000000001'
      and f.property_id = '00000000-0000-4000-8000-000000000202'
      and f.description = 'Fine for trash bins visible from street on collection day.'
  )
limit 1;

insert into public.work_orders (organization_id, property_id, title, description, category, priority, status, vendor_id, due_date)
select
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000201',
  'Replace damaged irrigation heads',
  'Several sprinkler heads in the Cypress section need replacement.',
  'landscaping',
  'medium',
  'assigned',
  '00000000-0000-4000-8000-000000000301',
  current_date + interval '10 days'
where not exists (
  select 1 from public.work_orders
  where organization_id = '00000000-0000-4000-8000-000000000001'
    and title = 'Replace damaged irrigation heads'
);

insert into public.work_order_comments (organization_id, work_order_id, body)
select
  '00000000-0000-4000-8000-000000000001',
  wo.id,
  'Vendor confirmed site visit for next Tuesday.'
from public.work_orders wo
where wo.organization_id = '00000000-0000-4000-8000-000000000001'
  and wo.title = 'Replace damaged irrigation heads'
  and not exists (
    select 1 from public.work_order_comments c
    where c.work_order_id = wo.id
      and c.body = 'Vendor confirmed site visit for next Tuesday.'
  );
