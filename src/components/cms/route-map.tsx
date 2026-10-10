"use client";
import { useEffect, useMemo, useState } from "react";
type Route = {
  id: string;
  source: "page" | "document";
  title: string;
  path: string | null;
  preview: string | null;
  editor: string;
  status: "Published" | "Draft" | "Missing CMS record" | "Route mapping needed";
  locale: string;
  updatedAt: string | null;
};
export function RouteMap() {
  useEffect(() => {
    void load();
  }, []);
  const [routes, setRoutes] = useState<Route[]>([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false),
    [canEditPages, setCanEditPages] = useState(false),
    [query, setQuery] = useState("");
  async function load() {
    setBusy(true);
    try {
      const r = await fetch("/api/site-routes", { cache: "no-store" }),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      setRoutes(d.routes);
      setCanEditPages(d.canEditPages === true);
      setLoaded(true);
      setMessage(
        d.indexingEnabled
          ? "The sitemap lists eligible published pages."
          : "Sitemap indexing stays off until launch; drafts remain private.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not load page catalog.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function connectTemplates() {
    setBusy(true);
    try {
      const r = await fetch("/api/site-documents/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      setMessage(
        `${d.created.length} English page drafts connected to their approved designs. ${d.existing.length} already existed. Arabic pages remain flagged until their human translation is ready.`,
      );
      await load();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Could not connect the approved page designs.",
      );
    } finally {
      setBusy(false);
    }
  }
  const filtered = useMemo(
    () =>
      routes.filter((r) =>
        `${r.title} ${r.path ?? ""} ${r.locale} ${r.status}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [routes, query],
  );
  return (
    <section className="site-report" aria-label="All pages">
      <h2>Pages, routes & publication status</h2>
      <p role="status">{busy ? "Loading…" : message}</p>
      {loaded && (
        <label className="field-label">
          Search pages
          <input
            aria-label="Search page catalog"
            placeholder="Title, URL, language, or status"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      )}
      {loaded && (
        <p className="small">
          {filtered.length} results ·{" "}
          {
            routes.filter(
              (r) => r.locale === "en" && !r.id.startsWith("template:"),
            ).length
          }{" "}
          English pages connected ·{" "}
          {routes.filter((r) => r.id.startsWith("template:")).length}{" "}
          untranslated or unconnected routes marked below.
        </p>
      )}
      {loaded &&
        canEditPages &&
        routes.some(
          (r) => r.id.startsWith("template:") && r.locale === "en",
        ) && (
          <p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void connectTemplates()}
            >
              {busy ? "Connecting…" : "Connect approved English page designs"}
            </button>{" "}
            <span className="small">
              Creates private drafts for missing page records. Nothing is
              published or indexed.
            </span>
          </p>
        )}
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Page</th>
              <th>Public URL</th>
              <th>Language</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={`${r.source}:${r.id}`}>
                <td>{r.title}</td>
                <td>{r.path || "Route not assigned"}</td>
                <td>{r.locale.toUpperCase()}</td>
                <td>{r.status}</td>
                <td>
                  {r.updatedAt
                    ? new Date(r.updatedAt).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  {r.id.startsWith("template:") ? (
                    "Waiting for page draft"
                  ) : (
                    <>
                      <a href={r.editor}>Edit ↗</a>
                      {r.preview && (
                        <>
                          {" "}
                          ·{" "}
                          <a href={r.preview} target="_blank" rel="noreferrer">
                            Preview ↗
                          </a>
                        </>
                      )}
                      {r.status === "Published" && r.path && (
                        <>
                          {" "}
                          ·{" "}
                          <a href={r.path} target="_blank" rel="noreferrer">
                            Open live ↗
                          </a>
                        </>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
