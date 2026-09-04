import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Globe2, Flame, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiVoyagerEvent, aiVoyagerListEvents } from "@/lib/aiVoyagerApi";
import AiVoyagerCalendar from "@/components/ai-voyager/AiVoyagerCalendar";
import AiVoyagerRecommendations from "@/components/ai-voyager/AiVoyagerRecommendations";
import AiVoyagerGlobeLazy from "@/components/ai-voyager/AiVoyagerGlobeLazy";

export type AiVoyagerPrefill = {
  country?: string;
  countryCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  title?: string;
  description?: string;
};

function uniqueCountries(events: AiVoyagerEvent[]) {
  const set = new Set<string>();
  for (const e of events) set.add(String(e.countryCode || "").toUpperCase());
  return Array.from(set).filter(Boolean);
}

function heatmapCounts(events: AiVoyagerEvent[]) {
  const map = new Map<string, number>();
  for (const e of events) {
    const cc = String(e.countryCode || "").toUpperCase();
    if (!cc) continue;
    map.set(cc, (map.get(cc) || 0) + 1);
  }
  return map;
}

export default function AiVoyagerDashboard(props: { context: "home" | "dashboard" }) {
  const token = localStorage.getItem("token") || "";

  const [events, setEvents] = useState<AiVoyagerEvent[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [heatmapView, setHeatmapView] = useState(false);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<AiVoyagerPrefill | null>(null);
  const [focus, setFocus] = useState<{ countryCode?: string; lat?: number; lng?: number } | null>(null);

  const refresh = async () => {
    if (!token) return;
    setLoading(true);
    setEventsError(null);
    try {
      const out = await aiVoyagerListEvents(token);
      setEvents(out.events || []);
    } catch (e: any) {
      setEventsError(e?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) refresh();
  }, [token]);

  const visitedCountries = useMemo(() => uniqueCountries(events), [events]);
  const counts = useMemo(() => heatmapCounts(events), [events]);

  const visitedCount = visitedCountries.length;
  const progress50 = Math.min(100, Math.round((visitedCount / 50) * 100));
  const progress100 = Math.min(100, Math.round((visitedCount / 100) * 100));

  return (
    <div className={props.context === "home" ? "section-padding bg-background" : ""}>
      <div className={props.context === "home" ? "container mx-auto" : ""}>
        <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">AI Voyager — Enterprise Travel Dashboard</h2>
              <p className="text-sm text-muted-foreground mt-1">Plan, visualize, and analyze your travel events in one place.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => setHeatmapView((v) => !v)}>
                <Flame className="w-4 h-4" />
                {heatmapView ? "Heatmap: On" : "Heatmap: Off"}
              </Button>
              <Button size="sm" variant="outline" onClick={refresh} disabled={!token || loading}>
                Refresh
              </Button>
            </div>
          </div>

          {!token && <p className="text-sm text-muted-foreground mt-4">Sign in to use AI Voyager.</p>}
          {eventsError && <p className="text-sm text-destructive mt-4">{eventsError}</p>}

          {token && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-background rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarDays className="w-4 h-4 text-primary" /> Calendar
                </div>
                <div className="mt-4">
                  <AiVoyagerCalendar
                    token={token}
                    events={events}
                    activeDate={activeDate}
                    prefill={prefill}
                    onSelectDate={(d) => setActiveDate(d)}
                    onEventCreated={(e) => {
                      setEvents((prev) => [...prev, e].sort((a, b) => (a.date + (a.time || "")) > (b.date + (b.time || "")) ? 1 : -1));
                      setFocus({ countryCode: e.countryCode, lat: e.latitude, lng: e.longitude });
                    }}
                    onFocusRequested={(lat, lng, cc) => setFocus({ countryCode: cc, lat, lng })}
                  />
                </div>
              </div>

              <div className="bg-background rounded-xl border border-border p-4 lg:col-span-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Globe2 className="w-4 h-4 text-primary" /> Globe
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {events.length ? `${events.length} event(s)` : "No events yet"}
                  </div>
                </div>

                <div className="mt-4">
                  <AiVoyagerGlobeLazy
                    events={events}
                    heatmapCounts={counts}
                    heatmapView={heatmapView}
                    focus={focus}
                    onMarkerClick={(e) => setActiveDate(e.date)}
                  />
                </div>
              </div>

              <div className="bg-background rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Award className="w-4 h-4 text-primary" /> Travel Badges
                </div>
                <div className="mt-4 space-y-3">
                  <div className="border border-border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">You visited</p>
                    <p className="text-2xl font-display font-bold text-foreground">{visitedCount} Countries</p>
                  </div>
                  <div className="border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Progress to 50</p>
                    <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-2 bg-primary" style={{ width: `${progress50}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{progress50}%</p>
                  </div>
                  <div className="border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Progress to 100</p>
                    <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-2 bg-primary" style={{ width: `${progress100}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{progress100}%</p>
                  </div>
                </div>

                <div className="mt-6">
                  <AiVoyagerRecommendations
                    token={token}
                    onPick={(s) => {
                      setPrefill({ country: s.country, countryCode: s.countryCode });
                      setFocus({ countryCode: s.countryCode });
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
