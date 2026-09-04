import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { dispatchTripPlansChanged } from "@/lib/tripPlansEvents";

type TripPlan = {
  id: number;
  trip_title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  travelers_count: number;
  estimated_budget: string | number | null;
  contact_phone: string | null;
  contact_email: string | null;
  special_requests: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const TripPlanEdit = () => {
  const token = localStorage.getItem("token");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [tripTitle, setTripTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState("planned");

  useEffect(() => {
    const run = async () => {
      if (!token || !id) return;
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/user/trip-plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json?.message || "Failed to load trip plan");
          return;
        }
        setTripPlan(json.tripPlan);
        setTripTitle(json.tripPlan.trip_title || "");
        setDestination(json.tripPlan.destination || "");
        setStatus(json.tripPlan.status || "planned");
      } catch {
        setError("Failed to reach backend");
      }
    };

    run();
  }, [token, id]);

  const save = async () => {
    if (!token || !id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/user/trip-plans/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trip_title: tripTitle,
          destination,
          status,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message || "Save failed");
        return;
      }

      dispatchTripPlansChanged();
      navigate(`/dashboard/trip-plans/${id}`);
    } catch {
      setError("Failed to reach backend");
    } finally {
      setSaving(false);
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
              <h1 className="text-3xl font-display font-bold text-foreground">Edit Trip Plan</h1>
              <p className="text-muted-foreground mt-2">Update your planned trip.</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          {tripPlan && (
            <div className="mt-8 bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Trip title</p>
                  <input
                    value={tripTitle}
                    onChange={(e) => setTripTitle(e.target.value)}
                    className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="planned">planned</option>
                    <option value="confirmed">confirmed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>

                <div className="flex gap-2 flex-wrap pt-2">
                  <Button variant="hero" onClick={save} disabled={saving || !tripTitle || !destination}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/dashboard/trip-plans/${tripPlan.id}`}>Cancel</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TripPlanEdit;
