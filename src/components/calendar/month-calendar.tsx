"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, parseISO, startOfMonth, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/services/calendar-service";

type MonthCalendarProps = {
  events: CalendarEvent[];
  initialDate?: string;
  onSelectDate?: (date: string) => void;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({ events, initialDate, onSelectDate }: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => (initialDate ? parseISO(initialDate) : new Date()));
  const [selectedDate, setSelectedDate] = useState(() => format(initialDate ? parseISO(initialDate) : new Date(), "yyyy-MM-dd"));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);

  function selectDate(date: Date) {
    const iso = format(date, "yyyy-MM-dd");
    setSelectedDate(iso);
    onSelectDate?.(iso);
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</div>
          <div className="text-xs text-muted-foreground">{events.length} events this month</div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
        {weekdayLabels.map((label) => (
          <div key={label} className="px-2 py-2">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate.get(iso) ?? [];
          const isSelected = selectedDate === iso;
          const inMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={iso}
              type="button"
              onClick={() => selectDate(day)}
              className={cn(
                "min-h-24 border-b border-r p-2 text-left transition-colors hover:bg-muted/50",
                !inMonth && "bg-muted/20 text-muted-foreground",
                isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/30"
              )}
            >
              <div className={cn("mb-1 text-sm font-medium", isToday && "text-primary")}>{format(day, "d")}</div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className={cn("truncate rounded px-1 py-0.5 text-[10px]", eventTypeClass(event.type))}>
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 ? <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</div> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function eventTypeClass(type: CalendarEvent["type"]) {
  switch (type) {
    case "inspection":
      return "bg-primary/10 text-primary";
    case "meeting":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-300";
    case "violation":
      return "bg-amber-500/10 text-amber-800 dark:text-amber-200";
    case "work_order":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
}
