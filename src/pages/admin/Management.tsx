import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "@/components/admin/AdminShell";
import {
  adminCreateActivity,
  adminCreateDestination,
  adminCreateTrip,
  listDestinations,
  listTrips,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function AdminManagement() {
  const { token } = useAuth();
  const qc = useQueryClient();

  const { data: destinationsData } = useQuery({
    queryKey: ["public", "destinations"],
    queryFn: () => listDestinations(),
  });

  const { data: tripsData } = useQuery({
    queryKey: ["public", "trips"],
    queryFn: () => listTrips(),
  });

  const destinations = useMemo(() => destinationsData?.destinations || [], [destinationsData]);
  const trips = useMemo(() => tripsData?.trips || [], [tripsData]);

  const [destName, setDestName] = useState("");
  const [destDesc, setDestDesc] = useState("");
  const [destLoc, setDestLoc] = useState("");

  const [actDestinationId, setActDestinationId] = useState<string>("");
  const [actName, setActName] = useState("");
  const [actDesc, setActDesc] = useState("");
  const [actPrice, setActPrice] = useState<string>("");
  const [actDuration, setActDuration] = useState("");

  const [tripDestinationId, setTripDestinationId] = useState<string>("");
  const [tripStart, setTripStart] = useState("");
  const [tripEnd, setTripEnd] = useState("");
  const [tripCapacity, setTripCapacity] = useState<string>("");
  const [tripBasePrice, setTripBasePrice] = useState<string>("");
  const [tripActivityIds, setTripActivityIds] = useState<string>("");

  const createDestination = useMutation({
    mutationFn: () =>
      adminCreateDestination(token || "", {
        name: destName,
        description: destDesc,
        location: destLoc,
      }),
    onSuccess: async () => {
      toast({ title: "Created", description: "Destination added." });
      setDestName("");
      setDestDesc("");
      setDestLoc("");
      await qc.invalidateQueries({ queryKey: ["public", "destinations"] });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message }),
  });

  const createActivity = useMutation({
    mutationFn: () =>
      adminCreateActivity(token || "", {
        destinationId: Number(actDestinationId),
        name: actName,
        description: actDesc,
        price: actPrice ? Number(actPrice) : 0,
        duration: actDuration,
      }),
    onSuccess: () => {
      toast({ title: "Created", description: "Activity added." });
      setActName("");
      setActDesc("");
      setActPrice("");
      setActDuration("");
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message }),
  });

  const createTrip = useMutation({
    mutationFn: () =>
      adminCreateTrip(token || "", {
        destinationId: Number(tripDestinationId),
        startDate: tripStart,
        endDate: tripEnd,
        capacity: Number(tripCapacity),
        basePrice: Number(tripBasePrice),
        activityIds: tripActivityIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((v) => Number(v)),
      }),
    onSuccess: async () => {
      toast({ title: "Created", description: "Trip added." });
      setTripStart("");
      setTripEnd("");
      setTripCapacity("");
      setTripBasePrice("");
      setTripActivityIds("");
      await qc.invalidateQueries({ queryKey: ["public", "trips"] });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message }),
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Management</h1>
          <p className="text-muted-foreground">Create destinations, activities, and trips.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border space-y-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Add Destination</h2>
            <input
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              placeholder="Name"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={destLoc}
              onChange={(e) => setDestLoc(e.target.value)}
              placeholder="Location"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              value={destDesc}
              onChange={(e) => setDestDesc(e.target.value)}
              placeholder="Description"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]"
            />
            <Button variant="hero" size="lg" className="w-full text-base py-6" disabled={createDestination.isPending} onClick={() => createDestination.mutate()}>
              {createDestination.isPending ? "Saving..." : "Create"}
            </Button>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border space-y-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Add Activity</h2>
            <select
              value={actDestinationId}
              onChange={(e) => setActDestinationId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select Destination</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              value={actName}
              onChange={(e) => setActName(e.target.value)}
              placeholder="Name"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={actDuration}
              onChange={(e) => setActDuration(e.target.value)}
              placeholder="Duration (e.g., 2h)"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={actPrice}
              onChange={(e) => setActPrice(e.target.value)}
              placeholder="Price"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              value={actDesc}
              onChange={(e) => setActDesc(e.target.value)}
              placeholder="Description"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]"
            />
            <Button variant="hero" size="lg" className="w-full text-base py-6" disabled={createActivity.isPending} onClick={() => createActivity.mutate()}>
              {createActivity.isPending ? "Saving..." : "Create"}
            </Button>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border space-y-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Add Trip</h2>
            <select
              value={tripDestinationId}
              onChange={(e) => setTripDestinationId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select Destination</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              value={tripStart}
              onChange={(e) => setTripStart(e.target.value)}
              placeholder="Start date (YYYY-MM-DD)"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={tripEnd}
              onChange={(e) => setTripEnd(e.target.value)}
              placeholder="End date (YYYY-MM-DD)"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={tripCapacity}
              onChange={(e) => setTripCapacity(e.target.value)}
              placeholder="Capacity"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={tripBasePrice}
              onChange={(e) => setTripBasePrice(e.target.value)}
              placeholder="Base price"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={tripActivityIds}
              onChange={(e) => setTripActivityIds(e.target.value)}
              placeholder="Activity IDs (comma-separated)"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button variant="hero" size="lg" className="w-full text-base py-6" disabled={createTrip.isPending} onClick={() => createTrip.mutate()}>
              {createTrip.isPending ? "Saving..." : "Create"}
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Current Trips</h2>
          <div className="divide-y divide-border">
            {trips.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">{t.destination_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.start_date} - {t.end_date}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">{t.capacity}</span>
              </div>
            ))}
            {trips.length === 0 && <div className="py-3 text-sm text-muted-foreground">No trips.</div>}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
