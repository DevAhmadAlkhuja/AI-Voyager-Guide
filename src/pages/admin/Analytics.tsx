import { useQuery } from "@tanstack/react-query";
import AdminShell from "@/components/admin/AdminShell";
import { adminAnalyticsOverview } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminAnalytics() {
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "analytics", "overview"],
    queryFn: () => adminAnalyticsOverview(token || ""),
    enabled: Boolean(token),
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Overview of platform activity.</p>
        </div>

        {error && (
          <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border">
            <div className="text-sm text-muted-foreground">{(error as Error).message}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Most Viewed Destinations</h2>
            <div className="divide-y divide-border">
              {isLoading && <div className="py-3 text-sm text-muted-foreground">Loading...</div>}
              {!isLoading && (data?.mostViewedDestinations?.length || 0) === 0 && (
                <div className="py-3 text-sm text-muted-foreground">No data.</div>
              )}
              {(data?.mostViewedDestinations || []).map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.location}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">{d.views}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Most Booked Destinations</h2>
            <div className="divide-y divide-border">
              {isLoading && <div className="py-3 text-sm text-muted-foreground">Loading...</div>}
              {!isLoading && (data?.mostBookedDestinations?.length || 0) === 0 && (
                <div className="py-3 text-sm text-muted-foreground">No data.</div>
              )}
              {(data?.mostBookedDestinations || []).map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.location}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">{d.bookings}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Most Booked Activities</h2>
            <div className="divide-y divide-border">
              {isLoading && <div className="py-3 text-sm text-muted-foreground">Loading...</div>}
              {!isLoading && (data?.mostBookedActivities?.length || 0) === 0 && (
                <div className="py-3 text-sm text-muted-foreground">No data.</div>
              )}
              {(data?.mostBookedActivities || []).map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">{a.name}</div>
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">{a.bookings}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">User Preference Trends</h2>
            <div className="divide-y divide-border">
              {isLoading && <div className="py-3 text-sm text-muted-foreground">Loading...</div>}
              {!isLoading && (data?.userPreferenceTrends?.length || 0) === 0 && (
                <div className="py-3 text-sm text-muted-foreground">No data.</div>
              )}
              {(data?.userPreferenceTrends || []).map((t) => (
                <div key={t.destination_id} className="py-3 flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">{t.destination_name}</div>
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">{t.actions}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
