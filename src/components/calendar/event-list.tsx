import Link from "next/link";
import { Calendar, ClipboardList, Gavel, ShieldAlert, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatLabel } from "@/lib/format";
import type { CalendarEvent } from "@/lib/services/calendar-service";

type EventListProps = {
  title: string;
  events: CalendarEvent[];
  selectedDate?: string;
};

const iconByType = {
  inspection: Calendar,
  meeting: Gavel,
  violation: ShieldAlert,
  work_order: Wrench
} as const;

export function EventList({ title, events, selectedDate }: EventListProps) {
  const filtered = selectedDate ? events.filter((event) => event.date === selectedDate) : events;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        {selectedDate ? <p className="text-sm text-muted-foreground">{formatDate(selectedDate)}</p> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events scheduled for this period.</p>
        ) : (
          filtered.map((event) => {
            const Icon = iconByType[event.type];
            return (
              <Link
                key={event.id}
                href={event.href}
                className="block rounded-md border bg-background p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{event.title}</div>
                      {event.description ? <div className="mt-1 text-xs text-muted-foreground">{event.description}</div> : null}
                      <div className="mt-2 text-xs text-muted-foreground">{event.meta}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{formatLabel(event.type)}</Badge>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
