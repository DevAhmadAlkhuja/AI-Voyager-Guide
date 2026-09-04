export type AiVoyagerEvent = {
  id: number;
  userId: number;
  date: string; // YYYY-MM-DD
  time: string | null;
  country: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  createdAt: string;
};

export type AiVoyagerEventCreate = {
  date: string;
  time?: string | null;
  country: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string | null;
};

export type AiSuggestion = {
  country: string;
  countryCode: string;
  reason: string;
};

const BACKEND_ORIGIN = "http://localhost:5000";

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function aiVoyagerListEvents(token: string): Promise<{ events: AiVoyagerEvent[] }> {
  const res = await fetch(`${BACKEND_ORIGIN}/api/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to load events");
  return { events: (json?.events || []) as AiVoyagerEvent[] };
}

export async function aiVoyagerCreateEvent(
  token: string,
  payload: AiVoyagerEventCreate,
): Promise<{ event: AiVoyagerEvent }> {
  const res = await fetch(`${BACKEND_ORIGIN}/api/events`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to create event");
  return { event: json.event as AiVoyagerEvent };
}

export async function aiVoyagerDeleteEvent(token: string, id: number): Promise<void> {
  const res = await fetch(`${BACKEND_ORIGIN}/api/events/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to delete event");
}

export async function aiVoyagerSuggestions(token: string): Promise<{ suggestions: AiSuggestion[] }> {
  const res = await fetch(`${BACKEND_ORIGIN}/api/ai/suggestions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to load suggestions");
  return { suggestions: (json?.suggestions || []) as AiSuggestion[] };
}
