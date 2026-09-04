import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import logoImage from "@/assets/logo.png";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { AUTH_CHANGED_EVENT } from "@/components/UserAvatarMenu";
import SearchBar from "@/components/SearchBar";
import NavMoreDropdown from "@/components/NavMoreDropdown";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token"));
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_CHANGED_EVENT, sync as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_CHANGED_EVENT, sync as EventListener);
    };
  }, []);

  const navItems = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.plan"), path: "/plan" },
    { label: t("nav.destinations"), path: "/destinations" },
    { label: t("nav.activities"), path: "/activities" },
    { label: t("nav.budget"), path: "/budget" },
    { label: t("nav.contact"), path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
 <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
<img 
  src={logoImage}
  alt="AI Voyager Guide Logo"
  className="w-full h-full object-contain p-1"
/>          </div>
          <span className="font-display text-lg font-bold text-foreground">
            AI Voyager <span className="text-primary">Guide</span>
          </span>        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {item.label}
            </Link>
          ))}
          <NavMoreDropdown variant="desktop" />
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <div className="w-72">
            <SearchBar placeholder="Search trips, destinations..." />
          </div>
          {/* Language switcher */}
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {language === "en" ? "عربي" : "EN"}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {token ? (
            <UserAvatarMenu />
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="p-2 text-muted-foreground">
            <Globe className="w-5 h-5" />
          </button>
          <button onClick={toggleTheme} className="p-2 text-muted-foreground">
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button className="p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-border bg-card px-4 pb-4 max-h-[70vh] overflow-y-auto">
          <div className="pt-3">
            <SearchBar placeholder="Search..." />
          </div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2">
            <NavMoreDropdown variant="mobile" onNavigate={() => setIsOpen(false)} />
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" className="flex-1" asChild>
              <Link to="/chatbot" onClick={() => setIsOpen(false)}>{t("nav.chatbot")}</Link>
            </Button>
            {token ? (
              <div className="flex-1 flex justify-end">
                <UserAvatarMenu align="start" />
              </div>
            ) : (
              <Button size="sm" className="flex-1" asChild>
                <Link to="/login" onClick={() => setIsOpen(false)}>{t("nav.login")}</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
