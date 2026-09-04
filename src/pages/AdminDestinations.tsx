import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type DestinationRow = {
  id: number;
  name: string;
  description: string;
  location: string;
  popularity_score: number;
};

const AdminDestinations = () => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [destinations, setDestinations] = useState<DestinationRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const loadAll = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/admin/destinations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message || "Failed to load destinations");
        return;
      }
      setDestinations(json.destinations || []);
    } catch {
      setError("Failed to reach backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "admin") loadAll();
  }, [token, user?.role]);

  const createDestination = async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/admin/destinations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, location, popularityScore: 0 }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message || "Create failed");
        return;
      }

      setName("");
      setLocation("");
      setDescription("");
      await loadAll();
    } catch {
      setError("Failed to reach backend");
    }
  };

  const deleteDestination = async (id: number) => {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/destinations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 204) {
        setDestinations((prev) => prev.filter((d) => d.id !== id));
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
              <h1 className="text-3xl font-display font-bold text-foreground">Destinations Management</h1>
              <p className="text-muted-foreground mt-2">Add and delete destinations.</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/admin">Back to dashboard</Link>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
              <h2 className="font-display font-semibold text-card-foreground">Add destination</h2>
              <div className="space-y-3 mt-4">
                <input
                  type="text"
                  placeholder="Country / City name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                />
                <Button variant="hero" className="w-full" onClick={createDestination} disabled={loading || !name || !location || !description}>
                  Create Destination
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
              <h2 className="font-display font-semibold text-card-foreground">Destinations</h2>
              {loading ? (
                <p className="text-sm text-muted-foreground mt-4">Loading...</p>
              ) : (
                <div className="space-y-3 mt-4">
                  {destinations.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.location}</p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => deleteDestination(d.id)}>
                        Delete
                      </Button>
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

export default AdminDestinations;
