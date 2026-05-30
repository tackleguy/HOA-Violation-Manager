import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getArchitecturalRows } from "@/lib/services/dashboard-service";

export default async function PortalRequestsPage() {
  const rows = await getArchitecturalRows();

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-3">
          <MessageSquare className="mr-1 h-3.5 w-3.5" />
          Resident portal
        </Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Requests</h1>
        <p className="mt-2 text-muted-foreground">Track architectural and modification requests submitted to the HOA.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Architectural requests</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests on file.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Property</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Reviewer</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="px-3 py-2">{row.title}</td>
                      <td className="px-3 py-2">{row.property}</td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{row.reviewer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Staff can review and update requests from the{" "}
            <Link href="/dashboard/architecture" className="text-primary hover:underline">
              architecture module
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
