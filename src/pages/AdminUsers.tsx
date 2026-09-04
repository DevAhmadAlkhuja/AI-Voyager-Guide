import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastSeen?: string;
  lastLoginAt?: string;
  lastActivityAt?: string;
  totalBookings?: number;
};

const AdminUsers = () => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json?.message || "Failed to load users");
          return;
        }
        setUsers(json.users || []);
      } catch {
        setError("Failed to reach backend");
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === "admin") run();
  }, [token, user?.role]);

  const deleteUser = async (id: number) => {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 204) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
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
              <h1 className="text-3xl font-display font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground mt-2">View and permanently delete users.</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/admin">Back to dashboard</Link>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          <div className="mt-8 bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">Bookings: {u.totalBookings ?? 0}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" disabled>
                        {u.role}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>
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
  );
};

export default AdminUsers;
