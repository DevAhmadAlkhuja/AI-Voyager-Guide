export type AdminDestinationRow = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  country: string | null;
  city: string | null;
  summary: string | null;
  featured_image: string | null;
  images: string | null;
  tags: string | null;
  is_published: number;
  priority: number;
  views_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminDestinationsListResponse = {
  destinations: AdminDestinationRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const BASE = "http://localhost:5000/api";

function authHeaders(token: string | null, extra?: Record<string, string>) {
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function adminListDestinations(params: {
  token: string;
  page?: number;
  limit?: number;
  q?: string;
  published?: "0" | "1" | "";
  sort?: string;
}): Promise<AdminDestinationsListResponse> {
  const u = new URL(`${BASE}/admin/destinations`);
  if (params.page) u.searchParams.set("page", String(params.page));
  if (params.limit) u.searchParams.set("limit", String(params.limit));
  if (params.q) u.searchParams.set("q", params.q);
  if (params.published === "0" || params.published === "1") u.searchParams.set("published", params.published);
  if (params.sort) u.searchParams.set("sort", params.sort);

  const res = await fetch(u.toString(), { headers: authHeaders(params.token) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to load destinations");
  return json;
}

export async function adminGetDestination(token: string, id: number) {
  const res = await fetch(`${BASE}/admin/destinations/${id}`, { headers: authHeaders(token) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to load destination");
  return json.destination as AdminDestinationRow;
}

export async function adminCreateDestination(token: string, payload: Record<string, unknown>) {
  const res = await fetch(`${BASE}/admin/destinations`, {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Create failed");
  return json.destination as AdminDestinationRow;
}

export async function adminUpdateDestination(token: string, id: number, payload: Record<string, unknown>) {
  const res = await fetch(`${BASE}/admin/destinations/${id}`, {
    method: "PUT",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Update failed");
  return json.destination as AdminDestinationRow;
}

export async function adminDeleteDestination(token: string, id: number) {
  const res = await fetch(`${BASE}/admin/destinations/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (res.status === 204) return;
  const json = await res.json().catch(() => ({}));
  throw new Error(json?.message || "Delete failed");
}

export async function adminBulkDeleteDestinations(token: string, ids: number[]) {
  const res = await fetch(`${BASE}/admin/destinations/bulk-delete`, {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify({ ids }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Bulk delete failed");
  return json as { deletedIds: number[] };
}

export async function adminTogglePublish(token: string, id: number, is_published?: number) {
  const res = await fetch(`${BASE}/admin/destinations/${id}/publish`, {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(is_published === undefined ? {} : { is_published }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Publish toggle failed");
  return json.destination as { id: number; is_published: number };
}

export async function adminUploadDestinationImage(token: string, file: File) {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`${BASE}/admin/uploads/destination-image`, {
    method: "POST",
    headers: authHeaders(token),
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Upload failed");
  return json as { url: string };
}
