"use client";
import { useEffect, useState } from "react";
import type { PageCatalogItem } from "@/content/page-catalog";
export function PagePicker({
  current,
  dirty = false,
  disabled = false,
}: {
  current?: string;
  dirty?: boolean;
  disabled?: boolean;
}) {
  const [pages, setPages] = useState<PageCatalogItem[]>([]),
    [query, setQuery] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/site-routes", { cache: "no-store", signal: abort.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw Error(data.error || "Could not load pages");
        setPages(data.routes);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message);
      });
    return () => abort.abort();
  }, []);
  const available = pages.filter((page) => !page.id.startsWith("template:"));
  const filtered = available.filter((page) =>
    page.id===current || `${page.title} ${page.path} ${page.locale}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <section className="cms-page-picker" aria-label="Switch page">
      <label className="field-label">
        Find a page
        <input
          type="search"
          placeholder="Page name or URL"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="field-label">
        Open page
        <select
          aria-label="Open page"
          value={current ?? ""}
          disabled={disabled || !available.length}
          onChange={(event) => {
            const page = available.find(
              (item) => item.id === event.target.value,
            );
            if (
              !page ||
              (dirty &&
                !window.confirm("Switch pages and discard unsaved changes?"))
            )
              return;
            window.location.assign(page.editor);
          }}
        >
          <option value="" disabled>
            Select a page
          </option>
          {[
            "Main pages",
            "Services",
            "Hosting",
            "Industries",
            "Arabic pages",
          ].map((group) => (
            <optgroup key={group} label={group}>
              {filtered
                .filter((page) => groupFor(page) === group)
                .map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title} · {page.path} · {page.status}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <small>
        {filtered.length} of {available.length} editable pages
      </small>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
function groupFor(page: PageCatalogItem) {
  if (page.locale === "ar") return "Arabic pages";
  if (page.path?.startsWith("/industries/")) return "Industries";
  if (page.path?.includes("hosting")) return "Hosting";
  return page.source === "document" &&
    !["/contact/", "/domains/"].includes(page.path ?? "")
    ? "Services"
    : "Main pages";
}
