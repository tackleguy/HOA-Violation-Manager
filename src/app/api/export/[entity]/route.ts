import { NextResponse } from "next/server";
import { apiError, requireTenantApiContext } from "@/lib/api/tenant-api";
import { exportEntity, type ExportEntity } from "@/lib/services/export-service";

const VALID_ENTITIES = new Set<ExportEntity>([
  "residents",
  "properties",
  "violations",
  "documents",
  "inspections",
  "architectural_requests",
  "announcements",
  "work_orders",
  "board_meetings",
  "compliance_report",
  "violation_summary",
  "financial_summary",
  "occupancy_stats"
]);

export async function GET(_request: Request, { params }: { params: Promise<{ entity: string }> }) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { entity } = await params;
  if (!VALID_ENTITIES.has(entity as ExportEntity)) {
    return apiError("Unsupported export entity.", 404);
  }

  try {
    const csv = await exportEntity(entity as ExportEntity);
    return new NextResponse(csv.content, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${csv.filename}"`,
        "X-Row-Count": String(csv.rowCount)
      }
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Export failed.", 500);
  }
}
