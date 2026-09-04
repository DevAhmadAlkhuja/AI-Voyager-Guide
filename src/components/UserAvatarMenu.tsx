import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StoredUser = {
  id?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
  role?: string;
};

function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getInitials(user: StoredUser | null) {
  const first = user?.firstName || user?.name || "";
  const last = user?.lastName || "";
  const a = String(first).trim().charAt(0).toUpperCase();
  const b = String(last).trim().charAt(0).toUpperCase();
  return (a + b).trim() || "U";
}

export const AUTH_CHANGED_EVENT = "auth:changed";

const UserAvatarMenu = ({ align = "end" }: { align?: "start" | "end" | "center" }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const sync = () => {
      setUser(getStoredUser());
      setImgLoaded(false);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") sync();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_CHANGED_EVENT, sync as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_CHANGED_EVENT, sync as EventListener);
    };
  }, []);

  const avatarSrc = useMemo(() => {
    const url = user?.profileImageUrl;
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `http://localhost:5000${url}`;
  }, [user?.profileImageUrl]);

  const initials = getInitials(user);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="w-9 h-9 rounded-full border border-border bg-background overflow-hidden flex items-center justify-center"
        >
          {avatarSrc ? (
            <div className="relative w-full h-full">
              {!imgLoaded && <div className="absolute inset-0 bg-secondary" />}
              <img
                src={avatarSrc}
                alt="avatar"
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(false)}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <span className="text-xs font-medium text-foreground">{initials}</span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-44">
        <DropdownMenuItem asChild>
          <Link to="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile/edit">Edit Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatarMenu;
