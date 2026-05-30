"use client";

import { useState } from "react";
import { format } from "date-fns";
import { EventList } from "@/components/calendar/event-list";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import type { CalendarMonthSummary } from "@/lib/services/calendar-service";

type CalendarViewProps = {
  data: CalendarMonthSummary;
};

export function CalendarView({ data }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
      <MonthCalendar events={data.events} onSelectDate={setSelectedDate} />
      <div className="space-y-4">
        <EventList title="Selected day" events={data.events} selectedDate={selectedDate} />
        <EventList title="All upcoming this month" events={data.events} />
      </div>
    </div>
  );
}
