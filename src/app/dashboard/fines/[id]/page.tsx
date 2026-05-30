import { formatDistanceToNow } from "date-fns";
import { CircleDollarSign } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/dashboard/detail-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getFineDetail } from "@/lib/services/fines-service";
import { getProperties, getResidents } from "@/lib/services/reference-data-service";
import { getViolationOptions } from "@/lib/services/fines-service";
import { formatDate, formatDateTime, formatLabel } from "@/lib/format";
import { recordFinePayment, updateFine, updateFineStatus } from "../../actions";

const statusOptions = ["issued", "paid", "waived", "overdue"].map((value) => ({
  value,
  label: formatLabel(value)
}));

export default async function FineDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const fine = await getFineDetail(id);
  if (!fine) notFound();

  const [properties, residents, violations] = await Promise.all([
    getProperties(),
    getResidents(),
    getViolationOptions()
  ]);

  const propertyLabel = fine.properties?.address ?? "Unknown property";
  const residentLabel = fine.residents
    ? `${fine.residents.first_name} ${fine.residents.last_name}`
    : "Unassigned";
  const amountPaid = fine.fine_payments.reduce((sum, payment) => sum + payment.amount_cents, 0);
  const balance = fine.amount_cents - amountPaid;

  const timeline = [
    {
      id: "issued",
      title: "Fine issued",
      description: fine.description,
      timestamp: formatDateTime(fine.issued_at)
    },
    ...fine.fine_payments.map((payment) => ({
      id: payment.id,
      title: "Payment recorded",
      description: `${formatCurrency(payment.amount_cents)} via ${formatLabel(payment.payment_method)}`,
      timestamp: formatDateTime(payment.created_at),
      actor: payment.profiles?.full_name ?? undefined
    }))
  ];

  return (
    <div className="space-y-4">
      {query.message ? <p className="text-sm text-primary">{query.message}</p> : null}
      {query.error ? <p className="text-sm text-destructive">{query.error}</p> : null}
      <DetailPage
        title={formatCurrency(fine.amount_cents)}
        subtitle={`${propertyLabel} · ${residentLabel}`}
        status={fine.status}
        icon={CircleDollarSign}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/fines">Back to list</Link>
          </Button>
        }
        timeline={timeline}
        tabs={[
          {
            id: "details",
            label: "Details",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Fine details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Property</p>
                    <p className="text-sm font-medium">{propertyLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Resident</p>
                    <p className="text-sm font-medium">{residentLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Amount</p>
                    <p className="text-sm font-medium">{formatCurrency(fine.amount_cents)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Balance</p>
                    <p className="text-sm font-medium">{formatCurrency(balance)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Due date</p>
                    <p className="text-sm font-medium">{formatDate(fine.due_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Issued</p>
                    <p className="text-sm font-medium">{formatDateTime(fine.issued_at)}</p>
                  </div>
                  {fine.violations ? (
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase text-muted-foreground">Linked violation</p>
                      <p className="text-sm">{fine.violations.description}</p>
                    </div>
                  ) : null}
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase text-muted-foreground">Description</p>
                    <p className="text-sm">{fine.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          },
          {
            id: "workflow",
            label: "Workflow",
            content: (
              <RecordForm
                title="Update status"
                submitLabel="Save status"
                action={updateFineStatus}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  {
                    name: "status",
                    label: "Status",
                    type: "select",
                    required: true,
                    defaultValue: fine.status,
                    selectOptions: statusOptions
                  }
                ]}
              />
            )
          },
          {
            id: "payments",
            label: "Payments",
            content: (
              <div className="space-y-4">
                <RecordForm
                  title="Record payment"
                  submitLabel="Record payment"
                  action={recordFinePayment}
                  fields={[
                    { name: "fine_id", label: "Fine", type: "hidden", defaultValue: id },
                    { name: "amount", label: "Amount (USD)", required: true, placeholder: "50.00" },
                    {
                      name: "payment_method",
                      label: "Payment method",
                      type: "select",
                      required: true,
                      selectOptions: ["check", "cash", "card", "ach", "other"].map((value) => ({
                        value,
                        label: formatLabel(value)
                      }))
                    },
                    { name: "reference_number", label: "Reference number" }
                  ]}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Payment history</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fine.fine_payments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No payments recorded.</p>
                    ) : (
                      fine.fine_payments.map((payment) => (
                        <div key={payment.id} className="rounded-md border p-3">
                          <p className="text-sm font-medium">
                            {formatCurrency(payment.amount_cents)} · {formatLabel(payment.payment_method)}
                          </p>
                          {payment.reference_number ? (
                            <p className="text-sm text-muted-foreground">Ref: {payment.reference_number}</p>
                          ) : null}
                          <p className="mt-2 text-xs text-muted-foreground">
                            {payment.profiles?.full_name ?? "Staff"} ·{" "}
                            {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          },
          {
            id: "edit",
            label: "Edit",
            content: (
              <RecordForm
                title="Edit fine"
                submitLabel="Save changes"
                action={updateFine}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  {
                    name: "property_id",
                    label: "Property",
                    type: "select",
                    required: true,
                    defaultValue: fine.property_id,
                    selectOptions: properties.map((p) => ({ value: p.id, label: p.label }))
                  },
                  {
                    name: "resident_id",
                    label: "Resident",
                    type: "select",
                    defaultValue: fine.resident_id ?? "",
                    selectOptions: [{ value: "", label: "None" }, ...residents.map((r) => ({ value: r.id, label: r.label }))]
                  },
                  {
                    name: "violation_id",
                    label: "Linked violation",
                    type: "select",
                    defaultValue: fine.violation_id ?? "",
                    selectOptions: [{ value: "", label: "None" }, ...violations.map((v) => ({ value: v.id, label: v.label }))]
                  },
                  {
                    name: "amount",
                    label: "Amount (USD)",
                    required: true,
                    defaultValue: String(fine.amount_cents / 100)
                  },
                  { name: "description", label: "Description", type: "textarea", required: true, defaultValue: fine.description },
                  { name: "due_date", label: "Due date", type: "date", defaultValue: fine.due_date ?? "" }
                ]}
              />
            )
          }
        ]}
      />
    </div>
  );
}
