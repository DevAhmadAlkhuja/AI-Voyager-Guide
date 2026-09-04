import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import "../syle.css"

type ProfileResponse = {
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    name: string;
    email: string;
    phone?: string;
    profileImageUrl?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    country?: string;
    city?: string;
    address?: string;
    postalCode?: string;
    language?: string;
    bio?: string;
    createdAt?: string;
    lastLoginAt?: string;
    lastActivityAt?: string;
  };
};

const Profile = () => {
  const token = localStorage.getItem("token");
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json?.message || "Failed to load profile");
          return;
        }
        setData(json);
      } catch {
        setError("Failed to reach backend");
      }
    };

    if (token) run();
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;

  const u = data?.user;
  const avatar = u?.profileImageUrl ? `http://localhost:5000${u.profileImageUrl}` : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground mt-2">Your personal details and preferences.</p>
            </div>
            <Button variant="hero" size="sm" asChild>
              <Link to="/profile/edit">Edit Profile</Link>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          {u && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border " id="pp" >
                <p className="text-sm font-medium text-card-foreground">Profile photo</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-border bg-background">
                    {avatar ? (
                      <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">{u.firstName || u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/profile/edit">Change photo</Link>
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border lg:col-span-2">
                <p className="text-sm font-medium text-card-foreground">Account</p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">First name</p>
                    <p className="text-sm text-foreground mt-1">{u.firstName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last name</p>
                    <p className="text-sm text-foreground mt-1">{u.lastName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm text-foreground mt-1">{u.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date of birth</p>
                    <p className="text-sm text-foreground mt-1">{u.dateOfBirth || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="text-sm text-foreground mt-1">{u.gender || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Preferred language</p>
                    <p className="text-sm text-foreground mt-1">{u.language || "—"}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-sm font-medium text-card-foreground">Address</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Country</p>
                      <p className="text-sm text-foreground mt-1">{u.country || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">City</p>
                      <p className="text-sm text-foreground mt-1">{u.city || "—"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm text-foreground mt-1">{u.address || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Postal code</p>
                      <p className="text-sm text-foreground mt-1">{u.postalCode || "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-sm font-medium text-card-foreground">About</p>
                  <p className="text-sm text-muted-foreground mt-2">{u.bio || "—"}</p>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-sm font-medium text-card-foreground">System</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm text-foreground mt-1">{u.createdAt || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last login</p>
                      <p className="text-sm text-foreground mt-1">{u.lastLoginAt || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last activity</p>
                      <p className="text-sm text-foreground mt-1">{u.lastActivityAt || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
