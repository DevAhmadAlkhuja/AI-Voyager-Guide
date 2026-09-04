import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminDestinationRow } from "@/lib/adminDestinationsApi";
import { adminUploadDestinationImage } from "@/lib/adminDestinationsApi";

type FormValue = {
  title: string;
  slug: string;
  subtitle: string;
  country: string;
  city: string;
  summary: string;
  description: string;
  tags: string;
  meta_title: string;
  meta_description: string;
  featured_image: string;
  images: string[];
  is_published: boolean;
  priority: string;
};

function parseTagsStringToJson(tags: string) {
  const arr = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return arr.length ? arr : null;
}

export default function DestinationForm(props: {
  initial?: AdminDestinationRow | null;
  token: string;
  submitLabel: string;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const initial = props.initial;

  const initialImages = useMemo(() => {
    try {
      const raw = initial?.images;
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }, [initial?.images]);

  const initialTags = useMemo(() => {
    try {
      const raw = initial?.tags;
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.join(", ") : "";
    } catch {
      return "";
    }
  }, [initial?.tags]);

  const [v, setV] = useState<FormValue>({
    title: "",
    slug: "",
    subtitle: "",
    country: "",
    city: "",
    summary: "",
    description: "",
    tags: "",
    meta_title: "",
    meta_description: "",
    featured_image: "",
    images: [],
    is_published: false,
    priority: "0",
  });

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setV({
      title: initial.title || "",
      slug: initial.slug || "",
      subtitle: initial.subtitle || "",
      country: initial.country || "",
      city: initial.city || "",
      summary: initial.summary || "",
      description: "",
      tags: initialTags,
      meta_title: (initial as any).meta_title || "",
      meta_description: (initial as any).meta_description || "",
      featured_image: (initial as any).featured_image || "",
      images: initialImages,
      is_published: Boolean(initial.is_published),
      priority: String(initial.priority ?? 0),
    });
  }, [initial, initialImages, initialTags]);

  const setField = (k: keyof FormValue, value: any) => {
    setV((prev) => ({ ...prev, [k]: value }));
  };

  const addImageUrl = (url: string) => {
    setV((prev) => ({ ...prev, images: [...prev.images, url] }));
    if (!v.featured_image) setField("featured_image", url);
  };

  const removeImageAt = (idx: number) => {
    setV((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const out = await adminUploadDestinationImage(props.token, file);
      addImageUrl(out.url);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const tagsArr = parseTagsStringToJson(v.tags);

      const payload: Record<string, unknown> = {
        title: v.title,
        slug: v.slug,
        subtitle: v.subtitle || null,
        country: v.country || null,
        city: v.city || null,
        summary: v.summary || null,
        description: v.description || undefined,
        tags: tagsArr,
        meta_title: v.meta_title || null,
        meta_description: v.meta_description || null,
        featured_image: v.featured_image || null,
        images: v.images,
        is_published: v.is_published ? 1 : 0,
        priority: Number(v.priority || 0),
      };

      if (!payload.title) throw new Error("Title is required");
      if (!payload.slug) throw new Error("Slug is required");

      await props.onSubmit(payload);
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Title</p>
          <input
            aria-label="destination-title"
            value={v.title}
            onChange={(e) => setField("title", e.target.value)}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Slug</p>
          <input
            aria-label="destination-slug"
            value={v.slug}
            onChange={(e) => setField("slug", e.target.value)}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Country</p>
          <input
            aria-label="destination-country"
            value={v.country}
            onChange={(e) => setField("country", e.target.value)}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">City</p>
          <input
            aria-label="destination-city"
            value={v.city}
            onChange={(e) => setField("city", e.target.value)}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        <div className="lg:col-span-2">
          <p className="text-sm text-muted-foreground">Summary</p>
          <textarea
            aria-label="destination-summary"
            rows={3}
            value={v.summary}
            onChange={(e) => setField("summary", e.target.value)}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
          />
        </div>

        <div className="lg:col-span-2">
          <p className="text-sm text-muted-foreground">Description</p>
          <textarea
            aria-label="destination-description"
            rows={6}
            value={v.description}
            onChange={(e) => setField("description", e.target.value)}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">Tip: paste sanitized text only.</p>
        </div>

        <div className="lg:col-span-2">
          <p className="text-sm text-muted-foreground">Tags (comma separated)</p>
          <input
            aria-label="destination-tags"
            value={v.tags}
            onChange={(e) => setField("tags", e.target.value)}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Meta title</p>
          <input
            aria-label="destination-meta-title"
            value={v.meta_title}
            onChange={(e) => setField("meta_title", e.target.value)}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Meta description</p>
          <input
            aria-label="destination-meta-description"
            value={v.meta_description}
            onChange={(e) => setField("meta_description", e.target.value)}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Priority</p>
          <input
            type="number"
            aria-label="destination-priority"
            value={v.priority}
            onChange={(e) => setField("priority", e.target.value)}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        <div className="flex items-end gap-2">
          <label className="text-sm text-muted-foreground">
            <input aria-label="destination-published" type="checkbox" checked={v.is_published} onChange={(e) => setField("is_published", e.target.checked)} /> Published
          </label>
        </div>

        <div className="lg:col-span-2">
          <p className="text-sm text-muted-foreground">Featured image URL</p>
          <input
            aria-label="destination-featured-image"
            value={v.featured_image}
            onChange={(e) => setField("featured_image", e.target.value)}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">Images</p>
            <input
              type="file"
              aria-label="destination-image-upload"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
                e.currentTarget.value = "";
              }}
            />
          </div>

          {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {v.images.map((url, idx) => (
              <div key={`${url}-${idx}`} className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground break-all">{url}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setField("featured_image", url)}>
                    Set Featured
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => removeImageAt(idx)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 flex gap-2 flex-wrap pt-2">
          <Button variant="hero" onClick={submit} disabled={saving}>
            {saving ? "Saving..." : props.submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
