import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocumentRows } from "@/lib/services/dashboard-service";

export default async function PortalDocumentsPage() {
  const rows = await getDocumentRows();
  const visibleRows = rows.filter((row) => {
    const access = String(row.access).toLowerCase();
    return access.includes("resident") || access.includes("public") || access.includes("all");
  });

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-3">
          <FileText className="mr-1 h-3.5 w-3.5" />
          Resident portal
        </Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Documents</h1>
        <p className="mt-2 text-muted-foreground">Community documents available to residents and viewers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shared documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No resident-visible documents published yet.</p>
          ) : (
            visibleRows.map((row, index) => (
              <div key={index} className="flex items-center justify-between rounded-md border bg-background p-3">
                <div>
                  <div className="text-sm font-medium">{row.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {row.category} · {row.version} · {row.access}
                  </div>
                </div>
              </div>
            ))
          )}
          <p className="text-xs text-muted-foreground">
            Full document management is available in the{" "}
            <Link href="/dashboard/documents" className="text-primary hover:underline">
              staff dashboard
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
