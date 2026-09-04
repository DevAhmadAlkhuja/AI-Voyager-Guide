import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "@/components/admin/AdminShell";
import { adminListUsers, adminUpdateUserRole, type UserRole } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminListUsers(token || ""),
    enabled: Boolean(token),
  });

  const mutation = useMutation({
    mutationFn: (payload: { userId: string; role: UserRole }) =>
      adminUpdateUserRole(token || "", payload.userId, payload.role),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "Updated", description: "User role updated." });
    },
    onError: (e) => {
      toast({ title: "Error", description: (e as Error).message });
    },
  });

  const filtered = useMemo(() => {
    const list = data?.users || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q));
  }, [data?.users, query]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Users</h1>
          <p className="text-muted-foreground">View users and manage roles.</p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border space-y-4">
          <div>
            <label className="text-sm font-medium text-card-foreground mb-2 block">Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && <div className="text-sm text-muted-foreground">{(error as Error).message}</div>}

          <div className="divide-y divide-border">
            {isLoading && <div className="py-3 text-sm text-muted-foreground">Loading...</div>}
            {!isLoading && filtered.length === 0 && <div className="py-3 text-sm text-muted-foreground">No users found.</div>}

            {filtered.map((u) => (
              <div key={u._id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">{u.role}</span>
                  {u.role === "admin" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ userId: u._id, role: "user" })}
                    >
                      Make User
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ userId: u._id, role: "admin" })}
                    >
                      Make Admin
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
