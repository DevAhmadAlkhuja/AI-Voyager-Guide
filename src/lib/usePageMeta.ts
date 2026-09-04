import { useEffect } from "react";

export function usePageMeta(meta: { title: string; description: string }) {
  useEffect(() => {
    document.title = meta.title;

    const name = "description";
    let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", meta.description);
  }, [meta.title, meta.description]);
}
