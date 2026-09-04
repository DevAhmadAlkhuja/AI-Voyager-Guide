export type SearchType = "page" | "trip" | "destination" | "stage" | "booking";

export type SearchResult = {
  type: SearchType;
  id: string;
  title: string;
  snippet: string;
  score: number;
  meta?: Record<string, unknown>;
};

export type SearchResponse = {
  q: string;
  page: number;
  limit: number;
  total: number;
  facets: Record<string, number>;
  results: SearchResult[];
  tookMs?: number;
};

const BASE = "http://localhost:5000/api";

export async function siteSearch(params: {
  q: string;
  types?: string; // csv
  page?: number;
  limit?: number;
  sort?: "relevance" | "newest" | "popular";
  fuzzy?: boolean;
  token?: string | null;
}): Promise<SearchResponse> {
  const u = new URL(`${BASE}/search`);
  u.searchParams.set("q", params.q);
  if (params.types) u.searchParams.set("types", params.types);
  if (params.page) u.searchParams.set("page", String(params.page));
  if (params.limit) u.searchParams.set("limit", String(params.limit));
  if (params.sort) u.searchParams.set("sort", params.sort);
  if (params.fuzzy) u.searchParams.set("fuzzy", "true");

  const headers: Record<string, string> = {};
  if (params.token) headers.Authorization = `Bearer ${params.token}`;

  const res = await fetch(u.toString(), { headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Search failed");
  return json as SearchResponse;
}
