import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search as SearchIcon, MapPin, CalendarDays, Ticket } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { siteSearch, type SearchResult } from "@/lib/searchApi";

function useQueryParam(name: string) {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search).get(name) || "", [search, name]);
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

function iconFor(type: SearchResult["type"]) {
  if (type === "page") return SearchIcon;
  if (type === "destination") return MapPin;
  if (type === "trip") return CalendarDays;
  if (type === "booking") return Ticket;
  return SearchIcon;
}

function hrefFor(r: SearchResult) {
  if (r.type === "page") return String(r.meta?.href || "/");
  if (r.type === "destination") return `/destinations/${encodeURIComponent(String(r.meta?.slug || r.id))}`;
  if (r.type === "trip") {
    const dest = String(r.meta?.destinationSlug || "");
    return dest ? `/destinations/${encodeURIComponent(dest)}` : "/destinations";
  }
  if (r.type === "stage") {
    const dest = String(r.meta?.destinationSlug || "");
    return dest ? `/destinations/${encodeURIComponent(dest)}` : "/activities";
  }
  if (r.type === "booking") return "/admin/trips";
  return "/";
}

const SearchPage = () => {
  const qParam = useQueryParam("q");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<{ total: number; facets: Record<string, number>; results: SearchResult[] } | null>(null);

  useEffect(() => {
    setPage(1);
  }, [qParam]);

  useEffect(() => {
    const run = async () => {
      if (!qParam.trim()) {
        setData({ total: 0, facets: {}, results: [] });
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const token = localStorage.getItem("token");
        const res = await siteSearch({ q: qParam.trim(), page, limit: 20, sort: "relevance", fuzzy: true, token });
        setData({ total: res.total, facets: res.facets || {}, results: res.results || [] });
      } catch (e: any) {
        setErr(e?.message || "Search failed");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [qParam, page]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <motion.div initial="hidden" animate="visible" className="mb-8">
            <motion.h1 custom={0} variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
              Search
            </motion.h1>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground">
              {qParam ? (
                <>Results for <span className="text-foreground font-medium">“{qParam}”</span></>
              ) : (
                "Type something in the search bar to begin."
              )}
            </motion.p>
          </motion.div>

          {err && (
            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border mb-6">
              <p className="text-sm text-muted-foreground">{err}</p>
            </div>
          )}

          {loading && (
            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border mb-6">
              <p className="text-sm text-muted-foreground">Searching…</p>
            </div>
          )}

          {data && !loading && (
            <>
              <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border mb-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">{data.total}</span> result{data.total === 1 ? "" : "s"}
                  </div>
                  <div className="flex gap-2 flex-wrap text-[11px] text-muted-foreground">
                    {Object.entries(data.facets || {}).map(([k, v]) => (
                      <span key={k} className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {data.results.length === 0 ? (
                <div className="text-center py-16">
                  <SearchIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No results found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.results.map((r, i) => {
                    const Icon = iconFor(r.type);
                    return (
                      <motion.div key={`${r.type}-${r.id}-${i}`} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                        <Link to={hrefFor(r)} className="block bg-card rounded-xl p-5 shadow-[var(--shadow-card)] border border-border card-lift">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="font-display font-semibold text-card-foreground truncate">{r.title}</h3>
                                <span className="text-[10px] text-muted-foreground capitalize">{r.type}</span>
                              </div>
                              {r.snippet ? <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.snippet}</p> : null}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {data.total > 20 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                    Prev
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">Page {page}</span>
                  <Button variant="secondary" onClick={() => setPage((p) => p + 1)} disabled={data.results.length < 20}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;
