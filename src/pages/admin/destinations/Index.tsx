import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import DestinationListItem from "@/components/admin/DestinationListItem";
import {
  adminBulkDeleteDestinations,
  adminDeleteDestination,
  adminListDestinations,
  adminTogglePublish,
  type AdminDestinationRow,
} from "@/lib/adminDestinationsApi";

export default function AdminDestinationsIndex() {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [rows, setRows] = useState<AdminDestinationRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [published, setPublished] = useState<"" | "0" | "1">("");
  const [sort, setSort] = useState("priority_desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [selected, setSelected] = useState<Record<number, boolean>>({});

  const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k)), [selected]);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminListDestinations({ token, q, published, sort, page, limit });
      setRows(res.destinations || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setSelected({});
    } catch (e: any) {
      setError(e?.message || "Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "admin") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role, page, sort, published]);

  const onSearch = async () => {
    setPage(1);
    await load();
  };

  const toggleSelected = (id: number) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const doDelete = async (id: number) => {
    if (!token) return;
    const ok = window.confirm("Delete this destination?");
    if (!ok) return;
    setError(null);
    try {
      await adminDeleteDestination(token, id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    }
  };

  const doTogglePublish = async (id: number) => {
    if (!token) return;
    setError(null);
    try {
      const updated = await adminTogglePublish(token, id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_published: updated.is_published } : r)));
    } catch (e: any) {
      setError(e?.message || "Publish toggle failed");
    }
  };

  const doBulkDelete = async () => {
    if (!token) return;
    if (!selectedIds.length) return;
    const ok = window.confirm(`Delete ${selectedIds.length} destinations?`);
    if (!ok) return;

    setError(null);
    try {
      await adminBulkDeleteDestinations(token, selectedIds);
      setRows((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelected({});
    } catch (e: any) {
      setError(e?.message || "Bulk delete failed");
    }
  };

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Destinations Management</h1>
              <p className="text-muted-foreground mt-2">Create, edit, publish and delete destinations.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" asChild>
                <Link to="/admin">Back to dashboard</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/admin/destinations/new">New destination</Link>
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          <div className="mt-8 bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-end justify-between">
              <div className="w-full lg:w-96">
                <p className="text-sm text-muted-foreground">Search</p>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <select
                    value={published}
                    onChange={(e) => setPublished(e.target.value as any)}
                    className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="">All</option>
                    <option value="1">Published</option>
                    <option value="0">Unpublished</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Sort</p>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="priority_desc">Priority desc</option>
                    <option value="priority_asc">Priority asc</option>
                    <option value="created_at_desc">Created desc</option>
                    <option value="created_at_asc">Created asc</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <Button variant="outline" onClick={onSearch} disabled={loading}>
                    {loading ? "Loading..." : "Search"}
                  </Button>
                  <Button variant="destructive" onClick={doBulkDelete} disabled={loading || selectedIds.length === 0}>
                    Bulk delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {rows.map((d) => (
                <DestinationListItem
                  key={d.id}
                  destination={d}
                  selected={Boolean(selected[d.id])}
                  onToggleSelected={() => toggleSelected(d.id)}
                  onDelete={() => doDelete(d.id)}
                  onTogglePublish={() => doTogglePublish(d.id)}
                />
              ))}
              {!loading && rows.length === 0 && <p className="text-sm text-muted-foreground">No destinations found.</p>}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
                Prev
              </Button>
              <p className="text-sm text-muted-foreground">Page {page} / {totalPages}</p>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
