import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSuggestion, aiVoyagerSuggestions } from "@/lib/aiVoyagerApi";

export default function AiVoyagerRecommendations(props: {
  token: string;
  onPick: (s: AiSuggestion) => void;
}) {
  const [items, setItems] = useState<AiSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const out = await aiVoyagerSuggestions(props.token);
        setItems(out.suggestions || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load suggestions");
      } finally {
        setLoading(false);
      }
    };

    if (props.token) run();
  }, [props.token]);

  return (
    <div className="border border-border rounded-lg p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="w-4 h-4 text-primary" /> Recommended For You
        </div>
        <div className="text-xs text-muted-foreground">{loading ? "..." : ""}</div>
      </div>

      {error && <p className="text-xs text-destructive mt-2">{error}</p>}

      <div className="mt-3 space-y-2">
        {items.map((s) => (
          <button
            key={s.countryCode}
            type="button"
            className="w-full text-left border border-border rounded-md p-2 hover:bg-accent transition-colors"
            onClick={() => props.onPick(s)}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{s.country}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {s.countryCode}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
          </button>
        ))}

        {!loading && !items.length && (
          <div className="text-xs text-muted-foreground">No suggestions yet. Add a few events to personalize.</div>
        )}
      </div>

      <div className="mt-3">
        <Button size="sm" variant="outline" onClick={() => window.location.assign("/destinations")}>
          Explore destinations
        </Button>
      </div>
    </div>
  );
}
