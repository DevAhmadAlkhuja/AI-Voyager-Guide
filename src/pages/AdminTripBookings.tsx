import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Navigate, Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

type BookingRow = {
  id: number;
  user_id: number;
  trip_id: number;
  travelers_count: number;
  total_price: number;
  status: string;
  notes: string | null;
  special_requests: string | null;
  created_at: string;
  user_name: string;
  user_email: string;
};

const AdminTripBookings = () => {
  const { id } = useParams<{ id: string }>();
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/trips/${id}/bookings`, {
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

    if (token && user?.role === "admin" && id) run();
  }, [token, user?.role, id]);

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Trip Bookings</h1>
              <p className="text-muted-foreground mt-2">Bookings for trip #{id}</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/admin/trips">Back to trips</Link>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          <div className="mt-8 bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{b.user_name} ({b.user_email})</p>
                    <p className="text-xs text-muted-foreground">{b.created_at}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Travelers: {b.travelers_count} • Total: {b.total_price} • Status: {b.status}</p>
                  {b.special_requests && <p className="text-sm text-muted-foreground mt-2">Requests: {b.special_requests}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTripBookings;
