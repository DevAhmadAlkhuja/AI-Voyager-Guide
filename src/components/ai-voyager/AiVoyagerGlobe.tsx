import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import type { AiVoyagerEvent } from "@/lib/aiVoyagerApi";
import { feature } from "topojson-client";

type GeoJsonFeature = {
  type: "Feature";
  properties?: Record<string, any>;
  geometry: any;
};

type Marker = {
  id: string;
  lat: number;
  lng: number;
  color: string;
  size: number;
  label: string;
  event: AiVoyagerEvent;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function heatColor(count: number) {
  // 1=light, 2-3=medium, 4+=deep
  if (count >= 4) return "#16a34a";
  if (count >= 2) return "#22c55e";
  return "#86efac";
}

function getFeatureIso2(f: GeoJsonFeature): string {
  const p = f?.properties || {};
  const candidates = [p.ISO_A2, p.ISO2, p.iso2, p.country_code, p.COUNTRY_CODE, p.ADM0_A3];
  const raw = candidates.find(Boolean);
  const s = String(raw || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(s) ? s : "";
}

export default function AiVoyagerGlobe(props: {
  events: AiVoyagerEvent[];
  heatmapCounts: Map<string, number>;
  heatmapView: boolean;
  focus: { countryCode?: string; lat?: number; lng?: number } | null;
  onMarkerClick: (e: AiVoyagerEvent) => void;
}) {
  const globeRef = useRef<any>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [countriesGeoJson, setCountriesGeoJson] = useState<{ features: GeoJsonFeature[] } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(0);

  const markers: Marker[] = useMemo(() => {
    return (props.events || [])
      .map((e) => {
        const id = `${e.id}`;
        const label = `${e.country} • ${e.city}\n${e.date}${e.time ? ` ${e.time}` : ""}\n${e.title}`;
        return {
          id,
          lat: e.latitude,
          lng: e.longitude,
          color: "#f97316",
          size: 0.4,
          label,
          event: e,
        };
      })
      .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));
  }, [props.events]);

  const activeCountryCode = String(props.focus?.countryCode || "").trim().toUpperCase();

  const heatPoints = useMemo(() => {
    // approximate: use the most recent event location per country
    const byCountry = new Map<string, AiVoyagerEvent>();
    for (const e of props.events || []) {
      const cc = String(e.countryCode || "").toUpperCase();
      if (!cc) continue;
      byCountry.set(cc, e);
    }

    const out: Array<{ lat: number; lng: number; weight: number; color: string }> = [];
    for (const [cc, e] of byCountry.entries()) {
      const count = props.heatmapCounts.get(cc) || 1;
      out.push({
        lat: e.latitude,
        lng: e.longitude,
        weight: clamp(count / 4, 0.15, 1),
        color: heatColor(count),
      });
    }
    return out;
  }, [props.events, props.heatmapCounts]);

  const visitedSet = useMemo(() => {
    const visited = new Set<string>();
    for (const k of props.heatmapCounts.keys()) visited.add(String(k || "").toUpperCase());
    return visited;
  }, [props.heatmapCounts]);

  const polygonColor = useMemo(() => {
    return (f: GeoJsonFeature) => {
      const iso2 = getFeatureIso2(f);
      const selected = iso2 && activeCountryCode && iso2 === activeCountryCode;
      if (selected) return "#22c55e";

      if (iso2 && visitedSet.has(iso2)) {
        const count = props.heatmapCounts.get(iso2) || 1;
        return props.heatmapView ? heatColor(count) : "#22c55e";
      }

      return "rgba(0,0,0,0)";
    };
  }, [props.heatmapCounts, props.heatmapView, activeCountryCode, visitedSet]);

  const visiblePolygons = useMemo(() => {
    const all = countriesGeoJson?.features || [];
    if (!all.length) return [];

    const out: GeoJsonFeature[] = [];
    for (const f of all) {
      const iso2 = getFeatureIso2(f);
      if (!iso2) continue;
      if (iso2 === activeCountryCode || visitedSet.has(iso2)) out.push(f);
    }
    return out;
  }, [countriesGeoJson, visitedSet, activeCountryCode]);

  const limitedMarkers = useMemo(() => {
    // Label rendering is expensive; cap to keep UI responsive.
    if (markers.length <= 200) return markers;
    return markers.slice(0, 200);
  }, [markers]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setGeoError(null);
        // Use a simplified world dataset to avoid freezing.
        // Source: world-atlas (110m resolution)
        const res = await fetch("https://unpkg.com/world-atlas@2/countries-110m.json");
        if (!res.ok) throw new Error("Failed to load country boundaries");
        const topo = await res.json();

        const geo = feature(topo, topo.objects.countries) as any;
        const features = Array.isArray(geo?.features) ? (geo.features as GeoJsonFeature[]) : [];
        if (!cancelled) setCountriesGeoJson({ features });
      } catch (e: any) {
        if (!cancelled) setGeoError(e?.message || "Failed to load country boundaries");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!globeRef.current || !ready) return;

    globeRef.current.controls().autoRotate = true;
    globeRef.current.controls().autoRotateSpeed = 0.35;
  }, [ready]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const apply = () => {
      const next = Math.max(0, Math.floor(el.getBoundingClientRect().width));
      setWidth(next);
    };

    apply();

    const ro = new ResizeObserver(() => apply());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!globeRef.current || !ready || !width) return;
    // Keep the earth centered initially in the available viewport.
    globeRef.current.pointOfView({ lat: 15, lng: 0, altitude: 2.1 }, 0);
  }, [ready, width]);

  useEffect(() => {
    if (!globeRef.current || !ready) return;
    const f = props.focus;
    if (!f) return;

    const lat = typeof f.lat === "number" ? f.lat : null;
    const lng = typeof f.lng === "number" ? f.lng : null;

    if (lat != null && lng != null) {
      globeRef.current.pointOfView({ lat, lng, altitude: 1.4 }, 900);
    }
  }, [props.focus, ready]);

  return (
    <div ref={hostRef} className="relative w-full h-[360px] rounded-lg overflow-hidden border border-border">
      <Globe
        ref={globeRef}
        width={width || (undefined as any)}
        height={360}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        polygonsData={visiblePolygons}
        polygonAltitude={(d: any) => {
          const iso2 = getFeatureIso2(d);
          const selected = iso2 && activeCountryCode && iso2 === activeCountryCode;
          if (selected) return 0.06;

          if (iso2 && props.heatmapCounts.has(iso2)) return props.heatmapView ? 0.025 : 0.02;
          return 0.01;
        }}
        polygonCapColor={polygonColor as any}
        polygonSideColor={() => "rgba(34,197,94,0.15)"}
        polygonStrokeColor={(d: any) => {
          const iso2 = getFeatureIso2(d);
          if (iso2 && activeCountryCode && iso2 === activeCountryCode) return "rgba(34,197,94,0.95)";
          if (iso2 && props.heatmapCounts.has(iso2)) return "rgba(34,197,94,0.45)";
          return "rgba(255,255,255,0.10)";
        }}
        pointsData={props.heatmapView ? heatPoints : []}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) => d.color}
        pointAltitude={(d: any) => d.weight}
        pointRadius={() => 0.35}
        pointResolution={6}
        labelsData={limitedMarkers}
        labelLat={(d: any) => d.lat}
        labelLng={(d: any) => d.lng}
        labelText={(d: any) => d.label}
        labelSize={(d: any) => d.size}
        labelColor={(d: any) => d.color}
        labelDotRadius={() => 0.65}
        labelDotOrientation={() => "bottom"}
        onLabelClick={(d: any) => props.onMarkerClick(d.event)}
        onGlobeReady={() => setReady(true)}
      />

      {geoError && (
        <div className="absolute left-0 right-0 bottom-0 p-2 bg-background/80 text-xs text-muted-foreground">
          {geoError}
        </div>
      )}
    </div>
  );
}
