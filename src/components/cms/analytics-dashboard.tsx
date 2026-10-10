"use client";
import { useEffect, useRef, useState } from "react";
import { SeoPerformanceDashboard } from "./seo-performance-dashboard";
import type { Report } from "@/server/analytics-reports";

type Reports = {
  gaTrend: Report;
  gaOverview: Report;
  gaPages: Report;
  gscTrend: Report;
  gscQueries: Report;
  gscPages: Report;
  previousQueries: Report;
  previousPages: Report;
  queryHistory: Report;
  pageHistory: Report;
};
function emptyReport(source: string): Report {
  return {
    source,
    status: "not_configured",
    message: "Connect this provider to display live data.",
    columns: [],
    rows: [],
    fetchedAt: "",
    period: "",
  };
}
const configs = [
  ["gaTrend", "ga4", "date"],
  ["gaOverview", "ga4", "overview"],
  ["gaPages", "ga4", "pages"],
  ["gscTrend", "gsc", "date"],
  ["gscQueries", "gsc", "queries"],
  ["gscPages", "gsc", "pages"],
  ["previousQueries", "gsc", "queries"],
  ["previousPages", "gsc", "pages"],
  ["queryHistory", "gsc", "queryHistory"],
  ["pageHistory", "gsc", "pageHistory"],
] as const;
function values(report: Report, metric: string) {
  const i = report.columns.findIndex(
    (v) => v.toLowerCase() === metric.toLowerCase(),
  );
  return i < 0 ? [] : report.rows.map((r) => Number.parseFloat(r[i]) || 0);
}
function fmt(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value > 9999 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}
function Chart({
  report,
  metric,
  color,
}: {
  report: Report;
  metric: string;
  color: string;
}) {
  const ys = values(report, metric);
  if (!ys.length)
    return (
      <div className="analytics-chart-empty">
        <svg
          className="analytics-chart"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 20H100 M0 45H100 M0 70H100 M0 94H100"
            stroke="#e4e9ed"
            fill="none"
          />
        </svg>
        <p className="analytics-empty">
          {report.status === "ready"
            ? "No trend data for this period."
            : "Connect reporting to display this trend."}
        </p>
      </div>
    );
  const max = Math.max(...ys, 1),
    min = Math.min(...ys, 0),
    span = Math.max(max - min, 1);
  const points = ys
    .map(
      (v, i) =>
        `${(i / Math.max(ys.length - 1, 1)) * 100},${94 - ((v - min) / span) * 82}`,
    )
    .join(" ");
  return (
    <svg
      className="analytics-chart"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      role="img"
      aria-label={`${metric} over time`}
    >
      <line x1="0" y1="94" x2="100" y2="94" stroke="#e4e9ed" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <text x="1" y="9" className="chart-label">
        {fmt(max)}
      </text>
      <text x="1" y="92" className="chart-label">
        {fmt(min)}
      </text>
    </svg>
  );
}
function Table({ report }: { report: Report }) {
  return report.rows.length ? (
    <div className="analytics-table-wrap">
      <table>
        <thead>
          <tr>
            {report.columns.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.rows.slice(0, 8).map((row, i) => (
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
    <p className="analytics-empty">No rows were returned for this period.</p>
  );
}
export function AnalyticsPanel() {
  const sequence = useRef(0);
  const [days, setDays] = useState("30"),
    [path, setPath] = useState(""),
    [tab, setTab] = useState("Dashboard"),
    [reports, setReports] = useState<Reports | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    void load();
    return () => {
      sequence.current++;
    };
  }, [days, path]);
  async function load() {
    const request = ++sequence.current;
    setBusy(true);
    setError("");
    setReports(null);
    try {
      const entries = await Promise.all(
        configs.map(async ([key, source, group]) => {
          const response = await fetch(
            `/api/analytics?source=${source}&group=${group}&days=${days}${path ? "&path=" + encodeURIComponent(path) : ""}${key.startsWith("previous") ? "&previous=true" : ""}`,
            { cache: "no-store" },
          );
          const data = await response.json();
          if (!response.ok)
            throw Error(data.error || "Unable to load analytics");
          return [key, data as Report] as const;
        }),
      );
      if (request === sequence.current)
        setReports(Object.fromEntries(entries) as Reports);
    } catch (e) {
      if (request === sequence.current)
        setError(e instanceof Error ? e.message : "Unable to load analytics");
    } finally {
      if (request === sequence.current) setBusy(false);
    }
  }
  const unavailable =
    reports && Object.values(reports).find((r) => r.status !== "ready");
  const gaTrend = reports?.gaTrend ?? emptyReport("ga4"),
    gaOverview = reports?.gaOverview ?? emptyReport("ga4"),
    gaPages = reports?.gaPages ?? emptyReport("ga4"),
    gscTrend = reports?.gscTrend ?? emptyReport("gsc"),
    gscQueries = reports?.gscQueries ?? emptyReport("gsc");
  const total = (r: Report | undefined, m: string) =>
    r ? values(r, m).reduce((a, b) => a + b, 0) : 0;
  const weightedPosition = () => {
    if (!gscTrend) return 0;
    const pos = gscTrend.columns.findIndex(
        (v) => v.toLowerCase() === "average position",
      ),
      imp = gscTrend.columns.findIndex(
        (v) => v.toLowerCase() === "impressions",
      );
    const rows = gscTrend.rows;
    const weight = rows.reduce((s, r) => s + (Number(r[imp]) || 0), 0);
    return weight
      ? rows.reduce(
          (s, r) => s + (Number(r[pos]) || 0) * (Number(r[imp]) || 0),
          0,
        ) / weight
      : 0;
  };
  const ctr =
    gscTrend && total(gscTrend, "Impressions")
      ? (total(gscTrend, "Clicks") / total(gscTrend, "Impressions")) * 100
      : 0;
  const tiles = (items: [string, string, string][]) => (
    <div className="analytics-kpis">
      {items.map(([label, value, color]) => (
        <article className="analytics-kpi" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <i style={{ backgroundColor: color }} />
        </article>
      ))}
    </div>
  );
  const metric = (report: Report, name: string) =>
    report.status === "ready" ? fmt(total(report, name)) : "—";
  return (
    <section className="site-report analytics-dashboard">
      <header className="analytics-heading">
        <div>
          <p className="analytics-eyebrow">Search & audience</p>
          <h2>SEO & Analytics</h2>
          <p>
            Real provider data from GA4 and Google Search Console. No estimates
            or sample metrics.
          </p>
        </div>
        <div className="analytics-controls">
          <label>
            Period
            <select value={days} onChange={(e) => setDays(e.target.value)}>
              {["7", "30", "90"].map((d) => (
                <option value={d} key={d}>
                  {d} days
                </option>
              ))}
            </select>
          </label>
          <button onClick={load} disabled={busy}>
            {busy ? "Loading reports…" : "Refresh data"}
          </button>
        </div>
      </header>
      <nav className="seo-dashboard-tabs" aria-label="SEO reports">
        {[
          "Dashboard",
          "Site Analytics",
          "SEO Performance",
          "Keywords",
          "Rank Tracker",
          "Index Status",
        ].map((name) => (
          <button
            type="button"
            key={name}
            aria-pressed={tab === name}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </nav>
      {tab !== "Site Analytics" && (
        <SeoPerformanceDashboard
          path={path}
          onPath={setPath}
          tab={tab}
          onTab={setTab}
          reports={{
            gscTrend,
            gscQueries,
            gscPages: reports?.gscPages ?? emptyReport("gsc"),
            previousQueries: reports?.previousQueries ?? emptyReport("gsc"),
            previousPages: reports?.previousPages ?? emptyReport("gsc"),
            queryHistory: reports?.queryHistory ?? emptyReport("gsc"),
            pageHistory: reports?.pageHistory ?? emptyReport("gsc"),
          }}
        />
      )}
      {error && (
        <p role="alert" className="analytics-alert">
          {error}
        </p>
      )}
      {unavailable && (
        <div
          className={
            unavailable.status === "error"
              ? "analytics-alert"
              : "analytics-connection"
          }
          role="status"
        >
          <strong>
            {unavailable.status === "error"
              ? "Google could not return the report."
              : "Google reporting is not connected yet."}
          </strong>
          <span>
            {unavailable.message}{" "}
            {unavailable.status === "not_configured"
              ? "Add a server-side Google access token, numeric GA4 property ID and verified Search Console property to load live results."
              : ""}
          </span>
        </div>
      )}
      {tab === "Site Analytics" && (
        <>
          <p className="analytics-updated">
            Previous {days} days, excluding today · Updated{" "}
            {gaTrend.fetchedAt
              ? new Date(gaTrend.fetchedAt).toLocaleString()
              : "Waiting for provider connection"}
          </p>
          <div className="analytics-section-title">
            <div>
              <h3>GA4 audience</h3>
              <p>Website visits and engagement</p>
            </div>
            <small>Google Analytics 4</small>
          </div>
          {tiles([
            ["Active users", metric(gaOverview, "activeUsers"), "#15a886"],
            ["Sessions", metric(gaOverview, "sessions"), "#4285e8"],
            ["Page views", metric(gaOverview, "screenPageViews"), "#e45e64"],
            ["Key events", metric(gaOverview, "keyEvents"), "#965bdd"],
          ])}
          <div className="analytics-columns">
            <article className="analytics-card">
              <h3>Traffic trend</h3>
              <Chart report={gaTrend!} metric="activeUsers" color="#2784e8" />
              <p className="analytics-chart-foot">Active users by day</p>
            </article>
            <article className="analytics-card">
              <h3>Top pages</h3>
              <Table report={gaPages!} />
            </article>
          </div>
          <div className="analytics-section-title">
            <div>
              <h3>SEO performance</h3>
              <p>Google Search results leading visitors to your site</p>
            </div>
            <small>Search Console</small>
          </div>
          {tiles([
            ["Search clicks", metric(gscTrend, "Clicks"), "#13a887"],
            ["Impressions", metric(gscTrend, "Impressions"), "#4285e8"],
            [
              "Average CTR",
              gscTrend.status === "ready" ? `${ctr.toFixed(2)}%` : "—",
              "#ed6264",
            ],
            [
              "Average position",
              gscTrend.status === "ready" && gscTrend.rows.length
                ? weightedPosition().toFixed(1)
                : "—",
              "#965bdd",
            ],
          ])}
          <div className="analytics-columns">
            <article className="analytics-card">
              <h3>Search trend</h3>
              <Chart report={gscTrend!} metric="Clicks" color="#14a887" />
              <p className="analytics-chart-foot">Clicks by day</p>
            </article>
            <article className="analytics-card">
              <h3>Top search queries / keywords</h3>
              <Table report={gscQueries!} />
              <p className="analytics-note">
                Search Console may hide anonymised queries and returns leading
                rows, not every search term.
              </p>
            </article>
          </div>
          <article className="analytics-card analytics-wide">
            <h3>Top pages in Google Search</h3>
            <Table report={reports?.gscPages ?? emptyReport("gsc")} />
          </article>
          <details className="analytics-privacy">
            <summary>What is measured?</summary>
            <p>
              GA4 reports aggregate usage such as pages visited, sessions,
              device category, broad geography and events. Search Console
              reports aggregate queries and pages with clicks, impressions,
              click-through rate and average position. These reports do not
              provide a visitor’s real-world identity. If Clarity is enabled
              separately, it can record click, scroll and pointer interactions
              for session playback. Never send names, email addresses or other
              personal details to analytics.
            </p>
          </details>
        </>
      )}
      {!reports && !error && (
        <div className="analytics-placeholder">
          <strong>Connect Google reporting to see live performance.</strong>
          <span>
            GA4 provides site usage. Search Console provides search queries,
            clicks, impressions, CTR and average position.
          </span>
        </div>
      )}
    </section>
  );
}
