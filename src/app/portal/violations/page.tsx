import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getViolationRows } from "@/lib/services/dashboard-service";

export default async function PortalViolationsPage() {
  const rows = await getViolationRows();

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-3">
          <ShieldAlert className="mr-1 h-3.5 w-3.5" />
          Resident portal
        </Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Violations</h1>
        <p className="mt-2 text-muted-foreground">Read-only view of community violation records and due dates.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community violations</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No violations to display.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Property</th>
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="px-3 py-2">{row.category}</td>
                      <td className="px-3 py-2">{row.property}</td>
                      <td className="px-3 py-2">{row.severity}</td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{row.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Need staff tools?{" "}
            <Link href="/dashboard/violations" className="text-primary hover:underline">
              Open dashboard violations
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
