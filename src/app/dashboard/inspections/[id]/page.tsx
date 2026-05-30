import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/dashboard/detail-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatLabel } from "@/lib/format";
import { getInspectionDetail } from "@/lib/services/dashboard-service";
import { completeInspection, createInspectionReport, updateInspection, uploadInspectionReportPhoto } from "../../actions";

export default async function InspectionDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const inspection = await getInspectionDetail(id);
  if (!inspection) notFound();

  const assignee = inspection.profiles?.full_name ?? "Unassigned";

  return (
    <div className="space-y-4">
      {query.message ? <p className="text-sm text-primary">{query.message}</p> : null}
      {query.error ? <p className="text-sm text-destructive">{query.error}</p> : null}
      <DetailPage
        title={inspection.title}
        subtitle={`Scheduled ${formatDateTime(inspection.scheduled_for)} · ${assignee}`}
        status={inspection.status}
        icon={CalendarCheck}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/inspections">Back to list</Link>
          </Button>
        }
        tabs={[
          {
            id: "schedule",
            label: "Schedule",
            content: (
              <div className="space-y-4">
                <RecordForm
                  title="Update inspection"
                  submitLabel="Save inspection"
                  action={updateInspection}
                  fields={[
                    { name: "id", label: "ID", type: "hidden", defaultValue: id },
                    { name: "title", label: "Title", required: true, defaultValue: inspection.title },
                    {
                      name: "scheduled_for",
                      label: "Scheduled for",
                      type: "datetime-local",
                      defaultValue: inspection.scheduled_for ? inspection.scheduled_for.slice(0, 16) : ""
                    },
                    {
                      name: "status",
                      label: "Status",
                      type: "select",
                      defaultValue: inspection.status,
                      selectOptions: ["scheduled", "in_progress", "completed", "canceled"].map((value) => ({
                        value,
                        label: formatLabel(value)
                      }))
                    }
                  ]}
                />
                {inspection.status !== "completed" ? (
                  <RecordForm
                    title="Complete inspection"
                    submitLabel="Mark completed"
                    action={completeInspection}
                    fields={[{ name: "id", label: "ID", type: "hidden", defaultValue: id }]}
                  />
                ) : null}
              </div>
            )
          },
          {
            id: "reports",
            label: "Reports",
            content: (
              <div className="space-y-4">
                <RecordForm
                  title="Create report"
                  submitLabel="Save report"
                  action={createInspectionReport}
                  fields={[
                    { name: "inspection_id", label: "Inspection", type: "hidden", defaultValue: id },
                    { name: "notes", label: "Notes", type: "textarea" },
                    { name: "recommendations", label: "Recommendations", type: "textarea" }
                  ]}
                />
                {inspection.inspection_reports.length > 0 ? (
                  <RecordForm
                    title="Upload report photo"
                    submitLabel="Upload photo"
                    action={uploadInspectionReportPhoto}
                    multipart
                    fields={[
                      {
                        name: "report_id",
                        label: "Report",
                        type: "select",
                        required: true,
                        selectOptions: inspection.inspection_reports.map((report) => ({
                          value: report.id,
                          label: `Report ${formatDateTime(report.created_at)}`
                        }))
                      },
                      { name: "caption", label: "Caption" },
                      { name: "file", label: "Photo", type: "file", required: true }
                    ]}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Create a report before uploading photos.</p>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Inspection reports</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {inspection.inspection_reports.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No reports submitted yet.</p>
                    ) : (
                      inspection.inspection_reports.map((report) => (
                        <div key={report.id} className="rounded-md border p-3">
                          <p className="text-sm">{report.notes ?? "Inspection report"}</p>
                          {report.recommendations ? (
                            <p className="mt-2 text-xs text-muted-foreground">Recommendations: {report.recommendations}</p>
                          ) : null}
                          <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(report.created_at)}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
