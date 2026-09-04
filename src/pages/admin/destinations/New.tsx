import { Navigate, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import DestinationForm from "@/components/admin/DestinationForm";
import { adminCreateDestination } from "@/lib/adminDestinationsApi";

export default function AdminDestinationsNew() {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const navigate = useNavigate();

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">New Destination</h1>
              <p className="text-muted-foreground mt-2">Create a destination and publish when ready.</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/admin/destinations">Back</Link>
            </Button>
          </div>

          <div className="mt-8">
            <DestinationForm
              token={token}
              submitLabel="Create"
              onSubmit={async (payload) => {
                const created = await adminCreateDestination(token, payload);
                if (created?.slug) {
                  window.open(`/destinations/${created.slug}`, "_blank");
                }
                navigate(`/admin/destinations/${created.id}/edit`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
