import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AUTH_CHANGED_EVENT } from "@/components/UserAvatarMenu";

type MeResponse = { user: { id: number; name: string; email: string; phone?: string; profileImageUrl?: string; role: string } };

const UserProfile = () => {
  const token = localStorage.getItem("token");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json?.message || "Failed to load profile");
          return;
        }
        setMe(json);
        setName(json.user?.name || "");
        setPhone(json.user?.phone || "");
        setProfileImageUrl(json.user?.profileImageUrl || "");
      } catch {
        setError("Failed to reach backend");
      }
    };

    if (token) run();
  }, [token]);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone, profileImageUrl }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message || "Save failed");
        return;
      }

      setMe(json);
      localStorage.setItem("user", JSON.stringify(json.user));
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      setSuccess("Profile updated");
    } catch {
      setError("Failed to reach backend");
    } finally {
      setSaving(false);
    }
  };

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground mt-2">Update your information.</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}
          {success && <p className="text-sm text-primary mt-6">{success}</p>}

          <div className="mt-8 bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border space-y-4">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            <input
              type="text"
              placeholder="Profile image URL"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            <Button variant="hero" className="w-full" onClick={save} disabled={saving}>
              Save
            </Button>
            {me?.user && (
              <p className="text-xs text-muted-foreground text-center">Logged in as: {me.user.email}</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;
