import { Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/dashboard/detail-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime, formatLabel } from "@/lib/format";
import { getPropertyDetail } from "@/lib/services/dashboard-service";
import { updateProperty } from "../../actions";

export default async function PropertyDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const property = await getPropertyDetail(id);
  if (!property) notFound();

  return (
    <div className="space-y-4">
      {query.message ? <p className="text-sm text-primary">{query.message}</p> : null}
      {query.error ? <p className="text-sm text-destructive">{query.error}</p> : null}
      <DetailPage
        title={property.address}
        subtitle={[property.section, property.parcel_number].filter(Boolean).join(" · ") || "Property record"}
        status={property.status}
        icon={Home}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/properties">Back to list</Link>
          </Button>
        }
        timeline={property.violations.map((violation) => ({
          id: violation.id,
          title: formatLabel(violation.status),
          description: violation.description,
          timestamp: formatDateTime(violation.created_at)
        }))}
        tabs={[
          {
            id: "details",
            label: "Details",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Property information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Parcel</p>
                    <p className="text-sm font-medium">{property.parcel_number ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Section</p>
                    <p className="text-sm font-medium">{property.section ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Status</p>
                    <p className="text-sm font-medium">{formatLabel(property.status)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Coordinates</p>
                    <p className="text-sm font-medium">
                      {property.latitude && property.longitude ? `${property.latitude}, ${property.longitude}` : "Not geocoded"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          },
          {
            id: "owners",
            label: "Owners",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Ownership records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {property.property_owners.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No owners linked.</p>
                  ) : (
                    property.property_owners.map((owner) => (
                      <div key={owner.id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">
                            {owner.residents ? `${owner.residents.first_name} ${owner.residents.last_name}` : "Resident"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatLabel(owner.owner_type)} · {formatDate(owner.start_date)}
                          </p>
                        </div>
                        {owner.residents ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/residents/${owner.resident_id}`}>View resident</Link>
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
                  <CardTitle>Compliance timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {property.violations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No violations on this property.</p>
                  ) : (
                    property.violations.map((violation) => (
                      <div key={violation.id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">{formatLabel(violation.status)} · {formatLabel(violation.severity)}</p>
                          <p className="text-xs text-muted-foreground">{violation.description}</p>
                          <p className="text-xs text-muted-foreground">Due {formatDate(violation.due_date)}</p>
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
                title="Edit property"
                submitLabel="Save property"
                action={updateProperty}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  { name: "address", label: "Address", required: true, defaultValue: property.address },
                  { name: "parcel_number", label: "Parcel number", defaultValue: property.parcel_number ?? "" },
                  { name: "section", label: "Section", defaultValue: property.section ?? "" },
                  {
                    name: "status",
                    label: "Status",
                    type: "select",
                    defaultValue: property.status,
                    selectOptions: ["clear", "violation", "review", "notice"].map((value) => ({ value, label: formatLabel(value) }))
                  }
                ]}
              />
            )
          }
        ]}
      />
    </div>
  );
}
