import { useEffect, useState } from "react";
import { Navigate, Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

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

const TripPlanDetails = () => {
  const token = localStorage.getItem("token");
  const { id } = useParams<{ id: string }>();

  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      } catch {
        setError("Failed to reach backend");
      }
    };

    run();
  }, [token, id]);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Trip Plan Details</h1>
              <p className="text-muted-foreground mt-2">View your planned trip.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" asChild>
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
              {id && (
                <Button size="sm" asChild>
                  <Link to={`/dashboard/trip-plans/${id}/edit`}>Edit</Link>
                </Button>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          {tripPlan && (
            <div className="mt-8 bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="text-lg font-semibold text-foreground">{tripPlan.trip_title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="text-sm text-foreground">{tripPlan.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p className="text-sm text-foreground">
                    {(tripPlan.start_date || "-") + " → " + (tripPlan.end_date || "-")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Travelers</p>
                  <p className="text-sm text-foreground">{tripPlan.travelers_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-sm text-foreground">{tripPlan.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm text-foreground">{tripPlan.created_at}</p>
                </div>
                {tripPlan.special_requests && (
                  <div>
                    <p className="text-sm text-muted-foreground">Details</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{tripPlan.special_requests}</p>
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

export default TripPlanDetails;
