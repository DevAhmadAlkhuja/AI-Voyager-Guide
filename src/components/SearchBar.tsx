import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteSearch, type SearchResult } from "@/lib/searchApi";

const RECENTS_KEY = "ai_voyager_recent_searches";

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  const s = String(q || "").trim();
  if (!s) return;
  const prev = loadRecents();
  const next = [s, ...prev.filter((x) => x.toLowerCase() !== s.toLowerCase())].slice(0, 8);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
}

type SearchBarProps = {
  className?: string;
  placeholder?: string;
};

const SearchBar = ({ className, placeholder = "Search..." }: SearchBarProps) => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const recents = useMemo(() => loadRecents(), []);

  useEffect(() => {
    if (!open) return;
    if (!q.trim()) {
      setItems([]);
      setLoading(false);
      return;
    }

    const id = window.setTimeout(async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await siteSearch({ q: q.trim(), limit: 6, page: 1, sort: "relevance", fuzzy: true, token });
        setItems(res.results || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(id);
  }, [q, open]);

  const submit = (query: string) => {
    const s = String(query || "").trim();
    if (!s) return;
    saveRecent(s);
    setOpen(false);
    setActive(-1);
    navigate(`/search?q=${encodeURIComponent(s)}`);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (active >= 0 && active < items.length) submit(items[active].title);
              else submit(q);
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((prev) => Math.min(prev + 1, items.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((prev) => Math.max(prev - 1, -1));
            }
            if (e.key === "Escape") {
              setOpen(false);
              setActive(-1);
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          aria-label="Site search"
          role="combobox"
          aria-expanded={open}
          aria-controls="ai-voyager-search-suggest"
        />
      </div>

      {open && (q.trim() || recents.length > 0) && (
        <div
          id="ai-voyager-search-suggest"
          role="listbox"
          className="absolute mt-2 w-full bg-card rounded-xl shadow-[var(--shadow-card)] border border-border overflow-hidden z-50"
        >
          {!q.trim() && recents.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-[11px] text-muted-foreground">Recent</div>
              {recents.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => submit(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {q.trim() && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[11px] text-muted-foreground">Suggestions</span>
                {loading && <span className="text-[11px] text-muted-foreground">Loading…</span>}
              </div>

              {items.length === 0 && !loading ? (
                <div className="px-3 py-3 text-sm text-muted-foreground">No suggestions</div>
              ) : (
                items.map((it, idx) => (
                  <button
                    key={`${it.type}-${it.id}-${idx}`}
                    role="option"
                    aria-selected={idx === active}
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg hover:bg-secondary",
                      idx === active ? "bg-secondary" : "",
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => submit(it.title)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{it.title}</div>
                        {it.snippet ? (
                          <div className="text-xs text-muted-foreground truncate">{it.snippet}</div>
                        ) : null}
                      </div>
                      <div className="text-[10px] text-muted-foreground capitalize">{it.type}</div>
                    </div>
                  </button>
                ))
              )}

              <div className="pt-2 px-2">
                <button
                  type="button"
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => submit(q)}
                >
                  View all results
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
