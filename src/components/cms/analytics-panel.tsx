"use client";
import { useState } from "react";
import type { Report } from "@/server/analytics-reports";
export function AnalyticsPanel() {
  const [source, setSource] = useState("ga4"),
    [group, setGroup] = useState("pages"),
    [days, setDays] = useState("28"),
    [report, setReport] = useState<Report | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function load() {
    setBusy(true);
    setError("");
    setReport(null);
    try {
      const response = await fetch(
        `/api/analytics?source=${source}&group=${group}&days=${days}`,
        { cache: "no-store" },
      );
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Unable to load report");
      setReport(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="site-report">
      <h2>Traffic, search & behaviour</h2>
      <div className="site-toolbar">
        <label>
          Report
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setGroup("pages");
              setReport(null);
            }}
          >
            <option value="ga4">Google Analytics</option>
            <option value="gsc">Search Console</option>
            <option value="clarity">Microsoft Clarity</option>
          </select>
        </label>
        {source !== "clarity" && (
          <>
            <label>
              Break down by
              <select
                value={group}
                onChange={(e) => {
                  setGroup(e.target.value);
                  setReport(null);
                }}
              >
                {[
                  "pages",
                  source === "gsc" ? "queries" : "sources",
                  "countries",
                  "devices",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Period
              <select
                value={days}
                onChange={(e) => {
                  setDays(e.target.value);
                  setReport(null);
                }}
              >
                {["7", "28", "90"].map((d) => (
                  <option value={d} key={d}>
                    {d} days
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <button disabled={busy} onClick={load}>
          {busy ? "Loading…" : "Load report"}
        </button>
      </div>
      <p role="status">{error || report?.message}</p>
      {report && (
        <>
          <p>
            {report.period} · Retrieved{" "}
            {new Date(report.fetchedAt).toLocaleString()}
          </p>
          {report.status === "ready" &&
            (report.rows.length ? (
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      {report.columns.map((c, i) => (
                        <th key={i}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No report rows for this period.</p>
            ))}
        </>
      )}
    </section>
  );
}
