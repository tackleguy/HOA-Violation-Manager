import { Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/dashboard/detail-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatLabel } from "@/lib/format";
import { getProperties } from "@/lib/services/reference-data-service";
import { getResidentDetail } from "@/lib/services/dashboard-service";
import { linkProperty, updateResident } from "../../actions";

export default async function ResidentDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const resident = await getResidentDetail(id);
  if (!resident) notFound();

  const properties = await getProperties();
  const fullName = `${resident.first_name} ${resident.last_name}`;

  return (
    <div className="space-y-4">
      {query.message ? <p className="text-sm text-primary">{query.message}</p> : null}
      {query.error ? <p className="text-sm text-destructive">{query.error}</p> : null}
      <DetailPage
        title={fullName}
        subtitle={resident.email ?? "No email on file"}
        icon={Users}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/residents">Back to directory</Link>
          </Button>
        }
        timeline={resident.violations.map((violation) => ({
          id: violation.id,
          title: formatLabel(violation.status),
          description: violation.description,
          timestamp: formatDateTime(violation.created_at)
        }))}
        sidebar={
          <RecordForm
            title="Link property"
            submitLabel="Link property"
            action={linkProperty}
            fields={[
              { name: "resident_id", label: "Resident", type: "hidden", defaultValue: id },
              {
                name: "property_id",
                label: "Property",
                type: "select",
                required: true,
                selectOptions: properties.map((p) => ({ value: p.id, label: p.label }))
              },
              {
                name: "owner_type",
                label: "Owner type",
                type: "select",
                defaultValue: "owner",
                selectOptions: [
                  { value: "owner", label: "Owner" },
                  { value: "tenant", label: "Tenant" },
                  { value: "occupant", label: "Occupant" }
                ]
              }
            ]}
          />
        }
        tabs={[
          {
            id: "profile",
            label: "Profile",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Contact information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{resident.email ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{resident.phone ?? "—"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase text-muted-foreground">Notes</p>
                    <p className="text-sm">{resident.notes ?? "No notes recorded."}</p>
                  </div>
                </CardContent>
              </Card>
            )
          },
          {
            id: "properties",
            label: "Properties",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Linked properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resident.property_owners.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No properties linked yet.</p>
                  ) : (
                    resident.property_owners.map((owner) => (
                      <div key={owner.id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">{owner.properties?.address ?? "Property"}</p>
                          <p className="text-xs text-muted-foreground">{formatLabel(owner.owner_type)}</p>
                        </div>
                        {owner.properties ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/properties/${owner.property_id}`}>View</Link>
                          </Button>
                        ) : null}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          },
          {
            id: "violations",
            label: "Violations",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Violation history</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resident.violations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No violations on record.</p>
                  ) : (
                    resident.violations.map((violation) => (
                      <div key={violation.id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">{formatLabel(violation.status)} · {formatLabel(violation.severity)}</p>
                          <p className="text-xs text-muted-foreground">{violation.description}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/violations/${violation.id}`}>View</Link>
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          },
          {
            id: "edit",
            label: "Edit",
            content: (
              <RecordForm
                title="Edit resident"
                submitLabel="Save resident"
                action={updateResident}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  { name: "first_name", label: "First name", required: true, defaultValue: resident.first_name },
                  { name: "last_name", label: "Last name", required: true, defaultValue: resident.last_name },
                  { name: "email", label: "Email", type: "email", defaultValue: resident.email ?? "" },
                  { name: "phone", label: "Phone", type: "tel", defaultValue: resident.phone ?? "" },
                  { name: "notes", label: "Notes", type: "textarea", defaultValue: resident.notes ?? "" }
                ]}
              />
            )
          }
        ]}
      />
    </div>
  );
}
