import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { label: string; path: string };

const items: Item[] = [
  { label: "Instructions", path: "/instructions" },
  { label: "FAQs", path: "/faqs" },
  { label: "Privacy Policy", path: "/privacy-policy" },
];

type NavMoreDropdownProps = {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function NavMoreDropdown({ variant, onNavigate }: NavMoreDropdownProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const buttonId = useId();
  const menuId = `${buttonId}-menu`;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [open]);

  const isDesktop = variant === "desktop";

  const desktopOpen = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  };

  const desktopCloseWithDelay = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 180);
  };

  const onKeyDownButton = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onKeyDownMenu = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const buttonClass = isDesktop
    ? "px-3 py-2 rounded-lg text-xs font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary"
    : "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground";

  return (
    <div
      ref={rootRef}
      className={cn("relative", isDesktop ? "" : "")}
      onMouseEnter={isDesktop ? desktopOpen : undefined}
      onMouseLeave={isDesktop ? desktopCloseWithDelay : undefined}
    >
      <button
        id={buttonId}
        type="button"
        className={cn(buttonClass, "flex items-center gap-1")}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={isDesktop ? undefined : () => setOpen((v) => !v)}
        onKeyDown={onKeyDownButton}
      >
        More
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open ? "rotate-180" : "rotate-0")} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={buttonId}
          onKeyDown={onKeyDownMenu}
          onMouseEnter={isDesktop ? desktopOpen : undefined}
          onMouseLeave={isDesktop ? desktopCloseWithDelay : undefined}
          className={cn(
            isDesktop
              ? "absolute left-0 mt-2 min-w-44 bg-card rounded-xl shadow-[var(--shadow-card)] border border-border overflow-hidden"
              : "mt-2 bg-card rounded-xl shadow-[var(--shadow-card)] border border-border overflow-hidden",
          )}
        >
          {items.map((it) => (
            <Link
              key={it.path}
              to={it.path}
              role="menuitem"
              tabIndex={0}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className={cn(
                "block px-4 py-3 text-sm transition-colors",
                location.pathname === it.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
