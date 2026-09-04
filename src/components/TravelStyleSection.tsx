import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DraggableGlobe from "@/components/DraggableGlobe";
import "./travel-style-section.css";

type TripType = "Tour" | "Flight" | "Hotel" | "Activity";

type Booking = {
  id: string;
  date: string; // YYYY-MM-DD
  tripName: string;
  tripType: TripType;
  notes: string;
  isMalaysia: boolean;
  createdAt: number;
  updatedAt: number;
};

type BookingMap = Record<string, Booking[]>;

const STORAGE_KEY = "local_bookings_v1";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function weekdayIndexSun0(d: Date) {
  return d.getDay();
}

function iconForType(t: TripType) {
  if (t === "Flight") return "✈";
  if (t === "Hotel") return "🏨";
  if (t === "Activity") return "🎒";
  return "🏝";
}

function safeParseBookings(raw: string | null): BookingMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as BookingMap;
  } catch {
    return {};
  }
}

const TravelStyleSection = () => {
  const stats = useMemo(
    () => ({ destinations: 125, countries: 51, continents: 4, goalPercent: 43 }),
    [],
  );

  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(() => toISODate(new Date()));

  const [bookingsByDate, setBookingsByDate] = useState<BookingMap>(() =>
    safeParseBookings(localStorage.getItem(STORAGE_KEY)),
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<{ date: string; bookingId?: string } | null>(null);

  const [tripName, setTripName] = useState("");
  const [tripType, setTripType] = useState<TripType>("Tour");
  const [notes, setNotes] = useState("");
  const [isMalaysia, setIsMalaysia] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingsByDate));
    } catch {
      // ignore
    }
  }, [bookingsByDate]);

  const monthLabel = useMemo(() => {
    return monthCursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [monthCursor]);

  const monthStart = useMemo(() => startOfMonth(monthCursor), [monthCursor]);
  const leadingEmpty = useMemo(() => weekdayIndexSun0(monthStart), [monthStart]);
  const totalDays = useMemo(() => daysInMonth(monthCursor), [monthCursor]);

  const monthDays = useMemo(() => {
    const cells: { date: string | null; day: number | null }[] = [];

    for (let i = 0; i < leadingEmpty; i++) cells.push({ date: null, day: null });

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day);
      cells.push({ date: toISODate(d), day });
    }

    while (cells.length % 7 !== 0) cells.push({ date: null, day: null });

    return cells;
  }, [leadingEmpty, totalDays, monthCursor]);

  const openAdd = (date: string) => {
    setSelectedDate(date);
    setEditing({ date });
    setTripName("");
    setTripType("Tour");
    setNotes("");
    setIsMalaysia(true);
    setDialogOpen(true);
  };

  const openEdit = (date: string, booking: Booking) => {
    setSelectedDate(date);
    setEditing({ date, bookingId: booking.id });
    setTripName(booking.tripName);
    setTripType(booking.tripType);
    setNotes(booking.notes);
    setIsMalaysia(booking.isMalaysia);
    setDialogOpen(true);
  };

  const saveBooking = () => {
    if (!editing?.date) return;

    const date = editing.date;
    const now = Date.now();

    setBookingsByDate((prev) => {
      const existing = prev[date] ? [...prev[date]] : [];

      if (editing.bookingId) {
        const idx = existing.findIndex((b) => b.id === editing.bookingId);
        if (idx >= 0) {
          existing[idx] = {
            ...existing[idx],
            tripName: tripName.trim() || existing[idx].tripName,
            tripType,
            notes,
            isMalaysia,
            updatedAt: now,
          };
        }
        return { ...prev, [date]: existing };
      }

      const b: Booking = {
        id: `b_${now}_${Math.random().toString(16).slice(2)}`,
        date,
        tripName: tripName.trim() || "New booking",
        tripType,
        notes,
        isMalaysia,
        createdAt: now,
        updatedAt: now,
      };

      return { ...prev, [date]: [...existing, b] };
    });

    setDialogOpen(false);
    setEditing(null);
  };

  const removeBooking = (date: string, bookingId: string) => {
    setBookingsByDate((prev) => {
      const arr = prev[date] ? prev[date].filter((b) => b.id !== bookingId) : [];
      const next = { ...prev };
      if (!arr.length) delete next[date];
      else next[date] = arr;
      return next;
    });
  };

  const selectedBookings = bookingsByDate[selectedDate] || [];

  const goPrevMonth = () => {
    setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-card rounded-xl overflow-hidden shadow-[var(--shadow-card)] border border-border">
            <div className="travel-style__panel">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Welcome</p>
                    <h3 className="font-display font-semibold text-card-foreground text-2xl">Your Travel Dashboard</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" /> Today you are planning for Malaysia
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-foreground">So far you’ve been to</p>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="travel-style__ringCard">
                      <div className="travel-style__ring" style={{ ['--ring' as any]: 0.72 }} aria-label="Destinations">
                        <div className="travel-style__ringInner">
                          <p className="text-xl font-display font-bold text-foreground">{stats.destinations}</p>
                          <p className="text-[11px] text-muted-foreground">destinations</p>
                        </div>
                      </div>
                    </div>

                    <div className="travel-style__ringCard">
                      <div className="travel-style__ring travel-style__ring--purple" style={{ ['--ring' as any]: 0.51 }} aria-label="Countries">
                        <div className="travel-style__ringInner">
                          <p className="text-xl font-display font-bold text-foreground">{stats.countries}</p>
                          <p className="text-[11px] text-muted-foreground">countries</p>
                        </div>
                      </div>
                    </div>

                    <div className="travel-style__ringCard">
                      <div className="travel-style__ring travel-style__ring--dark" style={{ ['--ring' as any]: 0.33 }} aria-label="Continents">
                        <div className="travel-style__ringInner">
                          <p className="text-xl font-display font-bold text-foreground">{stats.continents}</p>
                          <p className="text-[11px] text-muted-foreground">continents</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Which makes your travel goal completed by</p>
                    <p className="text-sm font-medium travel-style__green">{stats.goalPercent}%</p>
                  </div>
                  <div className="travel-style__progress" aria-label="Goal progress">
                    <div className="travel-style__progressFill" style={{ width: `${stats.goalPercent}%` }} />
                  </div>
                </div>
              </div>

              <div className="travel-style__mapWrap" aria-label="World map with Malaysia highlighted">
                <DraggableGlobe size="lg" variant="flat" label="" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-display font-semibold text-card-foreground text-xl flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" /> Travel Calendar
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Click a day to add bookings. You can add multiple bookings per day.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={goPrevMonth} aria-label="Previous month">
                  Prev
                </Button>
                <Button size="sm" variant="outline" onClick={goNextMonth} aria-label="Next month">
                  Next
                </Button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{monthLabel}</p>
              <Button size="sm" onClick={() => openAdd(selectedDate)} aria-label="Add booking">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-muted-foreground">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                <div key={d} className="text-center">{d}</div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {monthDays.map((cell, idx) => {
                const date = cell.date;
                const day = cell.day;
                const isSelected = date === selectedDate;
                const bookings = date ? bookingsByDate[date] || [] : [];
                const hasMalaysia = bookings.some((b) => b.isMalaysia);

                return (
                  <button
                    key={idx}
                    type="button"
                    className={
                      "travel-style__dayTile " +
                      (date ? "travel-style__dayTile--active" : "travel-style__dayTile--empty") +
                      (isSelected ? " travel-style__dayTile--selected" : "") +
                      (hasMalaysia ? " travel-style__dayTile--malaysia" : "")
                    }
                    onClick={() => date && setSelectedDate(date)}
                    onDoubleClick={() => date && openAdd(date)}
                    aria-label={date ? `Select ${date}` : "Empty"}
                    disabled={!date}
                  >
                    <div className="travel-style__dayNumber">{day || ""}</div>
                    {date && bookings.length > 0 && (
                      <div className="travel-style__dayBadges" aria-label="Bookings">
                        {bookings.slice(0, 3).map((b) => (
                          <span
                            key={b.id}
                            className={"travel-style__badge " + (b.isMalaysia ? "travel-style__badge--malaysia" : "")}
                            title={`${b.tripType}: ${b.tripName}`}
                          >
                            {iconForType(b.tripType)}
                          </span>
                        ))}
                        {bookings.length > 3 && <span className="travel-style__more">+{bookings.length - 3}</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm font-medium text-foreground">Bookings on {selectedDate}</p>
                <Button size="sm" variant="outline" onClick={() => openAdd(selectedDate)}>
                  <Plus className="w-4 h-4" /> Add booking
                </Button>
              </div>

              {selectedBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-3">No bookings for this day. Double-click a date to add one.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {selectedBookings.map((b) => (
                    <div
                      key={b.id}
                      className={
                        "flex items-start justify-between gap-3 border border-border rounded-lg p-3 " +
                        (b.isMalaysia ? "travel-style__bookingRow--malaysia" : "")
                      }
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {b.tripName} <span className="text-xs text-muted-foreground">({b.tripType})</span>
                        </p>
                        {b.notes ? <p className="text-xs text-muted-foreground mt-1">{b.notes}</p> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(selectedDate, b)} aria-label="Edit booking">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeBooking(selectedDate, b.id)}
                          aria-label="Remove booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.bookingId ? "Edit booking" : "Add booking"}</DialogTitle>
              <DialogDescription>
                Plan a trip or activity on <span className="font-medium">{editing?.date}</span>. Saved locally on this device.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Trip name / destination</p>
                <Input value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="e.g., Kuala Lumpur City Tour" />
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Trip type</p>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value as TripType)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Tour">Tour</option>
                  <option value="Flight">Flight</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Activity">Activity</option>
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Notes / special requests</p>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes..." />
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={isMalaysia}
                  onChange={(e) => setIsMalaysia(e.target.checked)}
                  className="h-4 w-4"
                />
                Malaysia-related booking (green highlight)
              </label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveBooking}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default TravelStyleSection;
