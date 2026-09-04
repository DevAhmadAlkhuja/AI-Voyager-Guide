import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TRIP_PLANS_CHANGED_EVENT } from "@/lib/tripPlansEvents";
import AiVoyagerDashboard from "@/components/ai-voyager/AiVoyagerDashboard";

type DashboardResponse = {
  user: { id: number; name: string; email: string; profileImageUrl?: string; phone?: string };
  stats: { totalBookings: number; upcomingTrips: number };
};

type TripPlanRow = {
  id: number;
  trip_title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  travelers_count: number;
  status: string;
  created_at: string;
};

function getFirstName(fullName: string | undefined | null) {
  const s = String(fullName || "").trim();
  if (!s) return "";
  return s.split(/\s+/)[0] || "";
}

function getStoredUserName(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const u = JSON.parse(raw);
    return String(u?.firstName || u?.name || "").trim();
  } catch {
    return "";
  }
}

const UserDashboard = () => {
  const token = localStorage.getItem("token");
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tripPlans, setTripPlans] = useState<TripPlanRow[]>([]);
  const [tripPlansError, setTripPlansError] = useState<string | null>(null);
  const [tripPlansLoading, setTripPlansLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json?.message || "Failed to load dashboard");
          return;
        }
        setData(json);
      } catch {
        setError("Failed to reach backend");
      }
    };

    if (token) run();
  }, [token]);

  useEffect(() => {
    const loadTripPlans = async () => {
      if (!token) return;
      setTripPlansLoading(true);
      setTripPlansError(null);
      try {
        const res = await fetch("http://localhost:5000/api/user/trip-plans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setTripPlansError(json?.message || "Failed to load trip plans");
          return;
        }
        setTripPlans(json.tripPlans || []);
      } catch {
        setTripPlansError("Failed to reach backend");
      } finally {
        setTripPlansLoading(false);
      }
    };

    const onChanged = () => loadTripPlans();
    window.addEventListener(TRIP_PLANS_CHANGED_EVENT, onChanged);
    if (token) loadTripPlans();
    return () => window.removeEventListener(TRIP_PLANS_CHANGED_EVENT, onChanged);
  }, [token]);

  const deleteTripPlan = async (id: number) => {
    if (!token) return;
    setTripPlansError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/user/trip-plans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) {
        setTripPlans((prev) => prev.filter((t) => t.id !== id));
        return;
      }
      const json = await res.json().catch(() => ({}));
      setTripPlansError(json?.message || "Delete failed");
    } catch {
      setTripPlansError("Failed to reach backend");
    }
  };

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            Hello {getFirstName(data?.user?.name) || getFirstName(getStoredUserName()) || "there"}
          </h1>
          <p className="text-muted-foreground mt-2">Manage your profile and bookings.</p>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          {data && (
            <div className="mt-8 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <p className="text-lg font-semibold text-foreground">{data.user.name}</p>
                  <p className="text-sm text-muted-foreground">{data.user.email}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/dashboard/profile">Edit profile</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/dashboard/bookings">My bookings</Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-xl p-4 shadow-[var(--shadow-card)] border border-border">
                  <p className="text-sm text-muted-foreground">Total bookings</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{data.stats.totalBookings}</p>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-[var(--shadow-card)] border border-border">
                  <p className="text-sm text-muted-foreground">Upcoming trips</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{data.stats.upcomingTrips}</p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
                <h2 className="font-display font-semibold text-card-foreground">Quick actions</h2>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/destinations">Browse destinations</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/plan">Plan a trip</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/dashboard/bookings">View bookings</Link>
                  </Button>
                </div>
              </div>

              <AiVoyagerDashboard context="dashboard" />

              <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="font-display font-semibold text-card-foreground">My Planned Trips</h2>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/plan">Create new</Link>
                  </Button>
                </div>

                {tripPlansError && <p className="text-sm text-destructive mt-4">{tripPlansError}</p>}
                {tripPlansLoading ? (
                  <p className="text-sm text-muted-foreground mt-4">Loading...</p>
                ) : (
                  <div className="space-y-3 mt-4">
                    {tripPlans.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3 flex-wrap">
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.trip_title}</p>
                          <p className="text-xs text-muted-foreground">{t.destination}</p>
                          <p className="text-xs text-muted-foreground mt-1">Travelers: {t.travelers_count} • Status: {t.status} • Created: {t.created_at}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/dashboard/trip-plans/${t.id}`}>View</Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/dashboard/trip-plans/${t.id}/edit`}>Edit</Link>
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteTripPlan(t.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                    {tripPlans.length === 0 && <p className="text-sm text-muted-foreground">No trip plans yet.</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;
