import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import DestinationForm from "@/components/admin/DestinationForm";
import { adminGetDestination, adminUpdateDestination, type AdminDestinationRow } from "@/lib/adminDestinationsApi";

export default function AdminDestinationsEdit() {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dest, setDest] = useState<AdminDestinationRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!token || !id) return;
      setError(null);
      try {
        const d = await adminGetDestination(token, Number(id));
        setDest(d);
      } catch (e: any) {
        setError(e?.message || "Failed to load destination");
      }
    };

    run();
  }, [token, id]);

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Edit Destination</h1>
              <p className="text-muted-foreground mt-2">Update metadata, images and publish status.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" asChild>
                <Link to="/admin/destinations">Back</Link>
              </Button>
              {dest?.slug && (
                <Button size="sm" variant="outline" onClick={() => window.open(`/destinations/${dest.slug}`, "_blank")}>
                  Preview
                </Button>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          <div className="mt-8">
            {dest ? (
              <DestinationForm
                token={token}
                initial={dest}
                submitLabel="Save"
                onSubmit={async (payload) => {
                  const updated = await adminUpdateDestination(token, Number(id), payload);
                  setDest(updated);
                  navigate(`/admin/destinations/${updated.id}/edit`);
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
