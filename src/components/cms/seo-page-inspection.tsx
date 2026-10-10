"use client";
import { useState, useRef, useEffect } from "react";
import type { Inspection } from "@/server/seo-inspection";
export function SeoPageInspection({
  path,
  indexAllowed,
  indexingEnabled,
}: {
  path: string;
  indexAllowed: boolean;
  indexingEnabled: boolean;
}) {
  const [index, setIndex] = useState<Inspection | null>(null),
    [speed, setSpeed] = useState<Inspection | null>(null),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const sequence = useRef(0);
  useEffect(() => {
    sequence.current++;
    setIndex(null);
    setSpeed(null);
    setBusy("");
    setError("");
    return () => {
      sequence.current++;
    };
  }, [path]);
  async function load(mode: "index" | "speed") {
    const request = ++sequence.current;
    setBusy(mode);
    setError("");
    try {
      const r = await fetch(
          "/api/seo-inspection?path=" +
            encodeURIComponent(path) +
            "&mode=" +
            mode,
        ),
        data = await r.json();
      if (!r.ok) throw Error(data.error);
      if (request === sequence.current)
        (mode === "index" ? setIndex : setSpeed)(data);
    } catch (e) {
      if (request === sequence.current) setError(String(e));
    } finally {
      if (request === sequence.current) setBusy("");
    }
  }
  return (
    <article className="analytics-card analytics-wide">
      <h3>Index status & PageSpeed</h3>
      <div className="seo-index-strip">
        {[
          ["Saved index setting", indexAllowed ? "Allowed" : "Noindex"],
          ["Site-wide indexing", indexingEnabled ? "Enabled" : "Disabled"],
          ["Google index", index?.index?.coverage ?? "Not inspected"],
          ["Mobile usability", index?.index?.mobile ?? "Not inspected"],
          ["Rich results", index?.index?.rich ?? "Not inspected"],
          ["Page fetch", index?.index?.fetch ?? "Not inspected"],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="cms-actions" style={{ marginTop: 16 }}>
        <button type="button" disabled={!!busy} onClick={() => load("index")}>
          {busy === "index" ? "Inspecting…" : "Inspect Google index"}
        </button>
        <button type="button" disabled={!!busy} onClick={() => load("speed")}>
          {busy === "speed" ? "Measuring…" : "Measure PageSpeed"}
        </button>
      </div>
      {index && (
        <p role="status" className="analytics-note">
          {index.message}
          {index.index &&
            ` Last crawl: ${index.index.lastCrawl} · Robots: ${index.index.robots} · Indexing: ${index.index.indexing}`}
        </p>
      )}
      {speed && (
        <>
          <div className="seo-index-strip">
            <div>
              <span>Desktop performance</span>
              <strong>{speed.speed?.desktop ?? "—"} / 100</strong>
            </div>
            <div>
              <span>Mobile performance</span>
              <strong>{speed.speed?.mobile ?? "—"} / 100</strong>
            </div>
            <div>
              <span>Desktop LCP</span>
              <strong>{speed.speed?.desktopLcp ?? "—"}</strong>
            </div>
            <div>
              <span>Mobile LCP</span>
              <strong>{speed.speed?.mobileLcp ?? "—"}</strong>
            </div>
          </div>
          <p role="status" className="analytics-note">
            {speed.message}
          </p>
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </article>
  );
}
