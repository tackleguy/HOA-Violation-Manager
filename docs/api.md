# HOAFlow API

HOAFlow includes tenant-scoped route handlers under `/api` for future integrations and internal clients. Every protected API route uses the current Supabase session, resolves the caller's active organization membership, and relies on Postgres RLS for final authorization.

## Authentication

Use Supabase Auth cookies from the web app session. Unauthenticated requests return `401`; authenticated users without an active organization membership return `403`.

## Error Format

```json
{ "error": "Message" }
```

## Endpoints

`GET /api/residents`
Returns residents for the active organization.

`POST /api/residents`
Creates a resident.

```json
{
  "first_name": "Marisol",
  "last_name": "Bennett",
  "email": "marisol@example.com",
  "phone": "555-0101",
  "notes": "Board communications preference: email"
}
```

`GET /api/properties`
Returns properties for the active organization.

`POST /api/properties`
Creates a property.

```json
{
  "address": "1844 Cypress Bend",
  "parcel_number": "CB-1844",
  "section": "Cypress",
  "status": "clear"
}
```

`GET /api/violations`
Returns violations for the active organization.

`POST /api/violations`
Creates a violation and writes an activity log.

```json
{
  "property_id": "00000000-0000-4000-8000-000000000001",
  "description": "Trash bins visible from street",
  "severity": "medium",
  "due_date": "2026-06-30"
}
```

`GET /api/documents`
Returns document records.

`POST /api/documents`
Creates document metadata. File uploads use the dashboard server action so files are stored in private Supabase Storage buckets with organization-prefixed paths.

`GET /api/architectural-requests`
Returns architectural requests.

`POST /api/architectural-requests`
Creates an architectural request.

`GET /api/inspections`
Returns inspections.

`POST /api/inspections`
Schedules an inspection.

`GET /api/activity`
Returns the latest 100 audit events for the active organization.
