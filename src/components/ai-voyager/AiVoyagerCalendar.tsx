import { useMemo, useState } from "react";
import { addMonths, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiVoyagerEvent } from "@/lib/aiVoyagerApi";
import AiVoyagerEventDialog from "@/components/ai-voyager/AiVoyagerEventDialog";

function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysGrid(month: Date) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const out: Date[] = [];
  for (let i = 0; i < 42; i++) out.push(addDays(start, i));
  return out;
}

export default function AiVoyagerCalendar(props: {
  token: string;
  events: AiVoyagerEvent[];
  activeDate: string | null;
  prefill: any;
  onSelectDate: (ymd: string) => void;
  onEventCreated: (e: AiVoyagerEvent) => void;
  onFocusRequested: (lat: number, lng: number, countryCode: string) => void;
}) {
  const [month, setMonth] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<string>(() => toYmd(new Date()));

  const active = props.activeDate || toYmd(new Date());

  const eventsByDate = useMemo(() => {
    const map = new Map<string, AiVoyagerEvent[]>();
    for (const e of props.events || []) {
      const arr = map.get(e.date) || [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return map;
  }, [props.events]);

  const grid = useMemo(() => daysGrid(month), [month]);
  const today = new Date();

  const openFor = (d: Date) => {
    const ymd = toYmd(d);
    props.onSelectDate(ymd);
    setDialogDate(ymd);
    setOpen(true);
  };

  const activeEvents = eventsByDate.get(active) || [];

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-foreground">{format(month, "MMMM yyyy")}</div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="outline" onClick={() => setMonth((m) => addMonths(m, -1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-[11px] text-muted-foreground">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((d) => {
          const ymd = toYmd(d);
          const inMonth = isSameMonth(d, month);
          const isToday = isSameDay(d, today);
          const isActive = ymd === active;
          const hasEvents = (eventsByDate.get(ymd) || []).length > 0;

          return (
            <button
              key={ymd}
              type="button"
              onClick={() => openFor(d)}
              className={
                "h-10 rounded-md border border-border text-sm flex flex-col items-center justify-center gap-0.5 hover:bg-accent transition-colors " +
                (inMonth ? "bg-background" : "bg-secondary/20") +
                (isActive ? " ring-2 ring-ring" : "")
              }
              title={hasEvents ? `${(eventsByDate.get(ymd) || []).length} event(s)` : ""}
            >
              <div className={"leading-none " + (isToday ? "text-primary font-semibold" : "text-foreground")}>
                {d.getDate()}
              </div>
              <div className="h-1 w-1 rounded-full" style={{ background: hasEvents ? "#22c55e" : "transparent" }} />
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Selected</div>
          <div className="text-sm font-medium text-foreground">{active}</div>
        </div>
        <Button size="sm" onClick={() => { setDialogDate(active); setOpen(true); }}>
          <Plus className="w-4 h-4" /> Add event
        </Button>
      </div>

      <div className="mt-3 space-y-2">
        {activeEvents.map((e) => (
          <div key={e.id} className="border border-border rounded-md p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{e.title}</p>
              <button
                type="button"
                className="text-[11px] text-primary underline"
                onClick={() => props.onFocusRequested(e.latitude, e.longitude, e.countryCode)}
              >
                Focus
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{e.country} • {e.city}{e.time ? ` • ${e.time}` : ""}</p>
          </div>
        ))}
        {!activeEvents.length && <div className="text-xs text-muted-foreground">No events for this date.</div>}
      </div>

      <AiVoyagerEventDialog
        token={props.token}
        open={open}
        date={dialogDate}
        prefill={props.prefill}
        onOpenChange={(v) => setOpen(v)}
        onCreated={(e) => {
          props.onEventCreated(e);
          setOpen(false);
        }}
      />
    </div>
  );
}
