import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { AiVoyagerEvent } from "@/lib/aiVoyagerApi";

const AiVoyagerGlobe = lazy(() => import("@/components/ai-voyager/AiVoyagerGlobe"));

export default function AiVoyagerGlobeLazy(props: {
  events: AiVoyagerEvent[];
  heatmapCounts: Map<string, number>;
  heatmapView: boolean;
  focus: { countryCode?: string; lat?: number; lng?: number } | null;
  onMarkerClick: (e: AiVoyagerEvent) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { root: null, threshold: 0.1 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={hostRef}>
      {!inView ? (
        <div className="w-full h-[360px] rounded-lg border border-border bg-secondary/20 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading globe...</div>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="w-full h-[360px] rounded-lg border border-border bg-secondary/20 flex items-center justify-center">
              <div className="text-sm text-muted-foreground">Loading globe...</div>
            </div>
          }
        >
          <AiVoyagerGlobe {...props} />
        </Suspense>
      )}
    </div>
  );
}
