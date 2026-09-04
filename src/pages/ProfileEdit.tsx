import { useEffect, useMemo, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AUTH_CHANGED_EVENT } from "@/components/UserAvatarMenu";
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

const ProfileEdit = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [original, setOriginal] = useState<ProfileResponse | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<string>("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [language, setLanguage] = useState("");
  const [bio, setBio] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const currentAvatarUrl = useMemo(() => {
    const u = original?.user;
    if (!u?.profileImageUrl) return null;
    return `http://localhost:5000${u.profileImageUrl}`;
  }, [original]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json?.message || "Failed to load profile");
          return;
        }
        setOriginal(json);

        setFirstName(json.user?.firstName || "");
        setLastName(json.user?.lastName || "");
        setEmail(json.user?.email || "");
        setPhone(json.user?.phone || "");
        setDateOfBirth(json.user?.dateOfBirth || "");
        setGender(json.user?.gender || "");
        setCountry(json.user?.country || "");
        setCity(json.user?.city || "");
        setAddress(json.user?.address || "");
        setPostalCode(json.user?.postalCode || "");
        setLanguage(json.user?.language || "");
        setBio(json.user?.bio || "");
      } catch {
        setError("Failed to reach backend");
      } finally {
        setLoading(false);
      }
    };

    if (token) run();
  }, [token]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const onPickAvatar = (file: File | null) => {
    setSuccess(null);
    setError(null);

    if (!file) {
      setAvatarFile(null);
      return;
    }

    const okTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!okTypes.includes(file.type)) {
      setError("Invalid file type. Allowed: jpg, png, webp");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File too large. Max 2MB");
      return;
    }

    setAvatarFile(file);
  };

  const uploadAvatar = async () => {
    if (!token || !avatarFile) return;
    setAvatarUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData();
      form.append("avatar", avatarFile);

      const res = await fetch("http://localhost:5000/api/user/profile/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message ? `${json.message}` : `Upload failed (${res.status})`);
        return;
      }

      setOriginal(json);
      localStorage.setItem("user", JSON.stringify(json.user));
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      setAvatarFile(null);
      setSuccess("Photo updated");
    } catch {
      setError("Failed to reach backend");
    } finally {
      setAvatarUploading(false);
    }
  };

  const deleteAvatar = async () => {
    if (!token) return;
    setAvatarUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:5000/api/user/profile/avatar", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message || "Delete failed");
        return;
      }

      setOriginal(json);
      localStorage.setItem("user", JSON.stringify(json.user));
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      setAvatarFile(null);
      setSuccess("Photo removed");
    } catch {
      setError("Failed to reach backend");
    } finally {
      setAvatarUploading(false);
    }
  };

  const save = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
          country,
          city,
          address,
          postalCode,
          language,
          bio,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message || "Save failed");
        return;
      }

      setOriginal(json);
      localStorage.setItem("user", JSON.stringify(json.user));
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      setSuccess("Profile saved");
    } catch {
      setError("Failed to reach backend");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    const u = original?.user;
    if (!u) return;

    setFirstName(u.firstName || "");
    setLastName(u.lastName || "");
    setEmail(u.email || "");
    setPhone(u.phone || "");
    setDateOfBirth(u.dateOfBirth || "");
    setGender(u.gender || "");
    setCountry(u.country || "");
    setCity(u.city || "");
    setAddress(u.address || "");
    setPostalCode(u.postalCode || "");
    setLanguage(u.language || "");
    setBio(u.bio || "");
    setAvatarFile(null);

    navigate("/profile");
  };

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">Edit Profile</h1>
              <p className="text-muted-foreground mt-2">Keep your details up to date.</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/profile">Back</Link>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}
          {success && <p className="text-sm text-primary mt-6">{success}</p>}

          {loading ? (
            <p className="text-sm text-muted-foreground mt-6">Loading...</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border" id="pp">
                <p className="text-sm font-medium text-card-foreground" >Profile photo</p>

                <div className="mt-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-border bg-background">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                    ) : currentAvatarUrl ? (
                      <img src={currentAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => onPickAvatar(e.target.files?.[0] || null)}
                      className="text-sm text-muted-foreground"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={uploadAvatar} disabled={!avatarFile || avatarUploading}>
                        Upload
                      </Button>
                      <Button size="sm" variant="destructive" onClick={deleteAvatar} disabled={avatarUploading}>
                        Delete
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Max 2MB. jpg / png / webp.</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border lg:col-span-2">
                <p className="text-sm font-medium text-card-foreground">Profile details</p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Preferred language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <textarea
                    placeholder="About me"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none md:col-span-2"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 flex-wrap">
                  <Button variant="outline" onClick={cancel} disabled={saving || avatarUploading}>
                    Cancel
                  </Button>
                  <Button variant="hero" onClick={save} disabled={saving || avatarUploading}>
                    Save
                  </Button>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-sm font-medium text-card-foreground">Security</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Password changes are handled separately for your security.
                  </p>
                  <div className="mt-3">
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/dashboard/profile">Change password</Link>
                    </Button>
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

export default ProfileEdit;
