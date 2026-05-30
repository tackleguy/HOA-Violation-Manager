insert into public.organizations (id, name, slug, plan, contact_email, contact_phone)
values ('00000000-0000-4000-8000-000000000001', 'Evergreen Ridge HOA', 'evergreen-ridge', 'professional', 'board@evergreenridge.test', '555-0100')
on conflict (slug) do nothing;

insert into public.residents (organization_id, first_name, last_name, email, phone, notes)
values
  ('00000000-0000-4000-8000-000000000001', 'Marisol', 'Bennett', 'marisol@example.com', '555-0101', 'Board communications preference: email'),
  ('00000000-0000-4000-8000-000000000001', 'Owen', 'Palmer', 'owen@example.com', '555-0102', 'Tenant record linked to Lake Vista property'),
  ('00000000-0000-4000-8000-000000000001', 'Nadia', 'Shah', 'nadia@example.com', '555-0103', 'Architectural committee member')
on conflict do nothing;

insert into public.properties (organization_id, address, parcel_number, section, status, latitude, longitude)
values
  ('00000000-0000-4000-8000-000000000001', '1844 Cypress Bend', 'CB-1844', 'Cypress', 'clear', 33.6412210, -117.8379910),
  ('00000000-0000-4000-8000-000000000001', '9013 Lake Vista', 'LV-9013', 'Lakeside', 'violation', 33.6425810, -117.8391200),
  ('00000000-0000-4000-8000-000000000001', '77 Stonebridge', 'SB-0077', 'Stonebridge', 'review', 33.6409820, -117.8364410)
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

insert into public.documents (organization_id, name, category, visibility)
values
  ('00000000-0000-4000-8000-000000000001', 'CC&Rs', 'CC&Rs', 'residents'),
  ('00000000-0000-4000-8000-000000000001', 'Community Rules', 'Community Rules', 'residents'),
  ('00000000-0000-4000-8000-000000000001', 'Board Minutes - May', 'Meeting Minutes', 'board')
on conflict do nothing;

insert into public.activity_logs (organization_id, action, target_table, metadata)
values
  ('00000000-0000-4000-8000-000000000001', 'workspace.seeded', 'organizations', '{"source":"seed.sql"}'),
  ('00000000-0000-4000-8000-000000000001', 'document.created', 'documents', '{"name":"CC&Rs"}'),
  ('00000000-0000-4000-8000-000000000001', 'inspection.scheduled', 'inspections', '{"section":"North gate"}');
