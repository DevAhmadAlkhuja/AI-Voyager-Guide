import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type AdminAnalyticsResponse = {
  stats: {
    totalUsers: number;
    newUsersToday: number;
    newUsersThisMonth: number;
    totalBookings: number;
    activeTrips: number;
  };
  mostBookedDestinations: Array<{ id: number; name: string; location: string; bookings: number }>;
  recentUsers: Array<{ id: number; name: string; email: string; role: string; createdAt: string }>;
  recentBookings: Array<{ id: number; user_id: number; trip_id: number; travelers_count: number; total_price: number; status: string; created_at: string; destination_name: string }>;
  recentContactMessages: Array<{ id: number; user_id: number | null; name: string | null; email: string | null; topic: string; message: string; created_at: string }>;
};

const AdminDashboard = () => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [data, setData] = useState<AdminAnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json?.message || "Failed to load admin analytics");
          return;
        }
        setData(json);
      } catch {
        setError("Failed to reach backend");
      }
    };

    if (token && user?.role === "admin") run();
  }, [token, user?.role]);

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">Overview of the platform.</p>
            </div>
            <Button size="sm" asChild>
              <Link to="/admin/users">User Management</Link>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          {data && (
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-card rounded-xl p-4 shadow-[var(--shadow-card)] border border-border">
                  <p className="text-sm text-muted-foreground">Total users</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{data.stats.totalUsers}</p>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-[var(--shadow-card)] border border-border">
                  <p className="text-sm text-muted-foreground">New users today</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{data.stats.newUsersToday}</p>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-[var(--shadow-card)] border border-border">
                  <p className="text-sm text-muted-foreground">New users this month</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{data.stats.newUsersThisMonth}</p>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-[var(--shadow-card)] border border-border">
                  <p className="text-sm text-muted-foreground">Total bookings</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{data.stats.totalBookings}</p>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-[var(--shadow-card)] border border-border">
                  <p className="text-sm text-muted-foreground">Active trips</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{data.stats.activeTrips}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
                  <h2 className="font-display font-semibold text-card-foreground">Most booked destinations</h2>
                  <div className="mt-4 space-y-3">
                    {data.mostBookedDestinations.map((d) => (
                      <div key={d.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.location}</p>
                        </div>
                        <p className="text-sm text-foreground">{d.bookings}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
                  <h2 className="font-display font-semibold text-card-foreground">Recent contact messages</h2>
                  <div className="mt-4 space-y-3">
                    {data.recentContactMessages.map((m) => (
                      <div key={m.id} className="border border-border rounded-lg p-3">
                        <p className="text-sm font-medium text-foreground">{m.topic}</p>
                        <p className="text-xs text-muted-foreground mt-1">{m.email || m.name || "Guest"}</p>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{m.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
                  <h2 className="font-display font-semibold text-card-foreground">Recent users</h2>
                  <div className="mt-4 space-y-3">
                    {data.recentUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{u.role}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
                  <h2 className="font-display font-semibold text-card-foreground">Recent bookings</h2>
                  <div className="mt-4 space-y-3">
                    {data.recentBookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{b.destination_name}</p>
                          <p className="text-xs text-muted-foreground">{b.status}</p>
                        </div>
                        <p className="text-sm text-foreground">{b.total_price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
                <h2 className="font-display font-semibold text-card-foreground">Quick actions</h2>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/admin/users">Manage users</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/admin/trips">Manage trips</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/admin/destinations">Manage destinations</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
