import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type TripRow = {
  id: number;
  destination_id: number;
  destination_name: string;
  destination_location: string;
  start_date: string;
  end_date: string;
  capacity: number;
  base_price: number;
};

type DestinationRow = { id: number; name: string; location: string };

const AdminTrips = () => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [trips, setTrips] = useState<TripRow[]>([]);
  const [destinations, setDestinations] = useState<DestinationRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [destinationId, setDestinationId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");
  const [basePrice, setBasePrice] = useState<string>("");

  const loadAll = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const [tripsRes, destRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/trips", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/admin/destinations", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const tripsJson = await tripsRes.json().catch(() => ({}));
      const destJson = await destRes.json().catch(() => ({}));

      if (!tripsRes.ok) {
        setError(tripsJson?.message || "Failed to load trips");
        return;
      }
      if (!destRes.ok) {
        setError(destJson?.message || "Failed to load destinations");
        return;
      }

      setTrips(tripsJson.trips || []);
      setDestinations(destJson.destinations || []);
    } catch {
      setError("Failed to reach backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "admin") loadAll();
  }, [token, user?.role]);

  const createTrip = async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/admin/trips", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destinationId: Number(destinationId),
          startDate,
          endDate,
          capacity: Number(capacity),
          basePrice: Number(basePrice),
          activityIds: [],
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message || "Create failed");
        return;
      }

      setDestinationId("");
      setStartDate("");
      setEndDate("");
      setCapacity("");
      setBasePrice("");
      await loadAll();
    } catch {
      setError("Failed to reach backend");
    }
  };

  const deleteTrip = async (id: number) => {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/trips/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 204) {
        setTrips((prev) => prev.filter((t) => t.id !== id));
        return;
      }

      const json = await res.json().catch(() => ({}));
      setError(json?.message || "Delete failed");
    } catch {
      setError("Failed to reach backend");
    }
  };

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Trips Management</h1>
              <p className="text-muted-foreground mt-2">Create and delete trips.</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/admin">Back to dashboard</Link>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
              <h2 className="font-display font-semibold text-card-foreground">Add trip</h2>
              <div className="space-y-3 mt-4">
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value="">Select destination</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.name} ({d.location})
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <input
                  type="number"
                  placeholder="Base price"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <Button variant="hero" className="w-full" onClick={createTrip} disabled={loading || !destinationId || !startDate || !endDate || !capacity || !basePrice}>
                  Create Trip
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
              <h2 className="font-display font-semibold text-card-foreground">Trips</h2>
              {loading ? (
                <p className="text-sm text-muted-foreground mt-4">Loading...</p>
              ) : (
                <div className="space-y-3 mt-4">
                  {trips.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.destination_name}</p>
                        <p className="text-xs text-muted-foreground">{t.start_date} → {t.end_date}</p>
                        <p className="text-xs text-muted-foreground mt-1">Capacity: {t.capacity} • Price: {t.base_price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin/trips/${t.id}/bookings`}>Bookings</Link>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteTrip(t.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTrips;
