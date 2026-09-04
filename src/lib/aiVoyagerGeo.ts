import countries from "world-countries";
import { City, Country, State } from "country-state-city";

export type AiVoyagerCountry = {
  name: string;
  countryCode: string; // ISO2
  latitude: number;
  longitude: number;
};

export type AiVoyagerCity = {
  name: string;
  countryCode: string; // ISO2
  latitude: number;
  longitude: number;
};

let cachedCountries: AiVoyagerCountry[] | null = null;
const cachedCitiesByCountry: Record<string, AiVoyagerCity[]> = {};

function asNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function loadAiVoyagerCountries(): AiVoyagerCountry[] {
  if (cachedCountries) return cachedCountries;

  cachedCountries = (countries as any[])
    .map((c) => {
      const name = String(c?.name?.common || c?.name || "").trim();
      const code = String(c?.cca2 || "").trim().toUpperCase();
      const latlng = Array.isArray(c?.latlng) ? c.latlng : [];

      return {
        name,
        countryCode: code,
        latitude: asNumber(latlng[0], 0),
        longitude: asNumber(latlng[1], 0),
      };
    })
    .filter((c) => c.name && /^[A-Z]{2}$/.test(c.countryCode))
    .sort((a, b) => a.name.localeCompare(b.name));

  return cachedCountries;
}

export function loadAiVoyagerCitiesByCountry(countryCode: string): AiVoyagerCity[] {
  const cc = String(countryCode || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return [];
  if (cachedCitiesByCountry[cc]) return cachedCitiesByCountry[cc];

  const cities: AiVoyagerCity[] = [];

  // Some countries have no states in the library; try country-wide cities first.
  // `country-state-city` stores this in memory, so it should be fast enough for UI use.
  const countryCities = City.getCitiesOfCountry(cc) as City[];
  for (const city of countryCities || []) {
    const name = String(city?.name || "").trim();
    if (!name) continue;
    cities.push({
      name,
      countryCode: cc,
      latitude: asNumber(city?.latitude, 0),
      longitude: asNumber(city?.longitude, 0),
    });
  }

  // Also attempt state-specific cities (some datasets have more coverage through states).
  const states = State.getStatesOfCountry(cc) as State[];
  for (const st of states || []) {
    const stateIso = String((st as any)?.isoCode || "").trim();
    if (!stateIso) continue;
    const cs = City.getCitiesOfState(cc, stateIso) as City[];
    for (const city of cs || []) {
      const name = String(city?.name || "").trim();
      if (!name) continue;
      cities.push({
        name,
        countryCode: cc,
        latitude: asNumber(city?.latitude, 0),
        longitude: asNumber(city?.longitude, 0),
      });
    }
  }

  // Keep this import used (and also ensures the library has country metadata loaded in some builds).
  // This call is intentionally not used for conditional gating.
  void (Country.getCountryByCode(cc) as Country | undefined);

  // Deduplicate by name.
  const seen = new Set<string>();
  const out = cities
    .filter((c) => {
      const key = c.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  cachedCitiesByCountry[cc] = out;
  return out;
}
