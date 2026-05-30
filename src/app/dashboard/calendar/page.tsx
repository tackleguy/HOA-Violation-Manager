import { CalendarDays } from "lucide-react";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Badge } from "@/components/ui/badge";
import { getCalendarMonth } from "@/lib/services/calendar-service";

export default async function CalendarPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const data = await getCalendarMonth();

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-3">
          <CalendarDays className="mr-1 h-3.5 w-3.5" />
          HOAFlow module
        </Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Community calendar</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Inspections, board meetings, violation due dates, and maintenance work orders in a unified month view.
        </p>
        {params.message ? <p className="mt-3 text-sm text-primary">{params.message}</p> : null}
        {params.error ? <p className="mt-3 text-sm text-destructive">{params.error}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total events</div>
          <div className="mt-1 text-2xl font-semibold">{data.totalEvents}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Inspections</div>
          <div className="mt-1 text-2xl font-semibold">{data.byType.inspection}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Meetings</div>
          <div className="mt-1 text-2xl font-semibold">{data.byType.meeting}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Due dates & work orders</div>
          <div className="mt-1 text-2xl font-semibold">{data.byType.violation + data.byType.work_order}</div>
        </div>
      </div>

      <CalendarView data={data} />
    </div>
  );
}
