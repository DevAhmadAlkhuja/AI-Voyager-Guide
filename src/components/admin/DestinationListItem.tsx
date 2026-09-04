import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { AdminDestinationRow } from "@/lib/adminDestinationsApi";

export default function DestinationListItem(props: {
  destination: AdminDestinationRow;
  selected: boolean;
  onToggleSelected: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const d = props.destination;

  return (
    <div className="flex items-center justify-between gap-3 border border-border rounded-lg p-3 flex-wrap">
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={props.selected} onChange={props.onToggleSelected} />
        <div>
          <p className="text-sm font-medium text-foreground">{d.title}</p>
          <p className="text-xs text-muted-foreground">/{d.slug}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {d.country || "-"}{d.city ? ` • ${d.city}` : ""} • Priority: {d.priority} • Views: {d.views_count} • Status: {d.is_published ? "published" : "unpublished"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link to={`/admin/destinations/${d.id}/edit`}>Edit</Link>
        </Button>
        <Button size="sm" variant="outline" onClick={props.onTogglePublish}>
          {d.is_published ? "Unpublish" : "Publish"}
        </Button>
        <Button size="sm" variant="destructive" onClick={props.onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
