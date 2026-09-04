import { useQuery } from "@tanstack/react-query";
import { Users, Shield } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { adminDashboardStats } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: () => adminDashboardStats(token || ""),
    enabled: Boolean(token),
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of users and platform stats.</p>
        </div>

        {error && (
          <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border">
            <div className="text-sm text-muted-foreground">{(error as Error).message}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border card-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase">Total Users</div>
                <div className="text-2xl font-display font-bold text-foreground">
                  {isLoading ? "..." : data?.totalUsers ?? 0}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border card-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase">Total Admins</div>
                <div className="text-2xl font-display font-bold text-foreground">
                  {isLoading ? "..." : data?.totalAdmins ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Newest Users</h2>
          <div className="divide-y divide-border">
            {(data?.newestUsers || []).map((u) => (
              <div key={u._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">{u.role}</span>
              </div>
            ))}
            {!isLoading && (data?.newestUsers?.length || 0) === 0 && (
              <div className="py-3 text-sm text-muted-foreground">No users found.</div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
