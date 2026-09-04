export type PublicDestinationRow = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  country: string | null;
  city: string | null;
  summary: string | null;
  long_description?: string | null;
  featured_image: string | null;
  images: string | null;
  tags: string | null;
  priority: number;
  views_count: number;
  created_at: string;
  updated_at: string;
};

const BASE = "http://localhost:5000/api";

export async function publicListDestinations(params: {
  page?: number;
  limit?: number;
  q?: string;
  country?: string;
  city?: string;
  sort?: string;
}) {
  const u = new URL(`${BASE}/destinations`);
  if (params.page) u.searchParams.set("page", String(params.page));
  if (params.limit) u.searchParams.set("limit", String(params.limit));
  if (params.q) u.searchParams.set("q", params.q);
  if (params.country) u.searchParams.set("country", params.country);
  if (params.city) u.searchParams.set("city", params.city);
  if (params.sort) u.searchParams.set("sort", params.sort);

  const res = await fetch(u.toString());
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to load destinations");
  return json as { destinations: PublicDestinationRow[] };
}

export async function publicGetDestination(slug: string) {
  const res = await fetch(`${BASE}/destinations/${encodeURIComponent(slug)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to load destination");
  return json.destination as PublicDestinationRow;
}
