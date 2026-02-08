import { useCallback, useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { api } from "@/lib/api";
import type { CalendarEvent } from "@/lib/types";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

interface CalEvent extends Event {
  color: string;
  calendarEvent: CalendarEvent;
}

export function DashboardCalendar() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = useCallback(async (date: Date) => {
    const start = startOfMonth(date).toISOString().slice(0, 10);
    const end = endOfMonth(date).toISOString().slice(0, 10);
    const data = await api.getCalendarEvents(start, end);
    setEvents(
      data.events.map((e) => ({
        title: `${e.company} — ${e.status}`,
        start: new Date(e.date),
        end: new Date(e.date),
        allDay: true,
        color: data.colorMap[e.status] ?? "#6b7280",
        calendarEvent: e,
      }))
    );
  }, []);

  useEffect(() => {
    fetchEvents(currentDate);
  }, [currentDate, fetchEvents]);

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
      views={["month", "week"]}
      defaultView="month"
      date={currentDate}
      onNavigate={setCurrentDate}
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: (event as CalEvent).color,
          border: "none",
          fontSize: "0.75rem",
        },
      })}
    />
  );
}
