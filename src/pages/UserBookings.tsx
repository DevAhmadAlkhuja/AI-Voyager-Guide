import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type BookingRow = {
  id: number;
  trip_id: number;
  travelers_count: number;
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
  start_date: string;
  end_date: string;
  base_price: number;
  destination_name: string;
  destination_location: string;
};

const UserBookings = () => {
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bookings/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json?.message || "Failed to load bookings");
          return;
        }
        setBookings(json.bookings || []);
      } catch {
        setError("Failed to reach backend");
      }
    };

    if (token) run();
  }, [token]);

  const cancelBooking = async (id: number) => {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message || "Cancel failed");
        return;
      }
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: json.booking.status } : b)));
    } catch {
      setError("Failed to reach backend");
    }
  };

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">My Bookings</h1>
              <p className="text-muted-foreground mt-2">Your booking history and statuses.</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          <div className="mt-8 bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.destination_name}</p>
                    <p className="text-xs text-muted-foreground">{b.start_date} → {b.end_date}</p>
                    <p className="text-xs text-muted-foreground mt-1">Status: {b.status} • Total: {b.total_price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" disabled>
                      {b.status}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => cancelBooking(b.id)} disabled={b.status === "cancelled"}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserBookings;
