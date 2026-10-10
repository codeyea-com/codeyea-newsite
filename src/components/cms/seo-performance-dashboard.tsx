"use client";
import { useEffect, useState } from "react";
import { SeoPageInspection } from "./seo-page-inspection";
import type { Report } from "@/server/analytics-reports";
import type { SeoCheck } from "@/content/seo-assessment";

type PageSeo = {
  id: string;
  title: string;
  path: string;
  editor: string;
  status: string;
  focusPhrase: string;
  indexAllowed: boolean;
  score: number | null;
  contentScore: number | null;
  checks: SeoCheck[];
  contentChecks: SeoCheck[];
};
export type SeoReports = {
  gscTrend: Report;
  gscQueries: Report;
  gscPages: Report;
  previousQueries: Report;
  previousPages: Report;
  queryHistory: Report;
  pageHistory: Report;
};
const colors = ["#14a17e", "#fb922e", "#e34962", "#d4d8de"];
function number(r: Report, row: string[], name: string) {
  return Number.parseFloat(row[r.columns.indexOf(name)]) || 0;
}
function total(r: Report, name: string) {
  return r.rows.reduce((sum, row) => sum + number(r, row, name), 0);
}
function pretty(n: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    notation: n >= 10000 ? "compact" : "standard",
  }).format(n);
}
function Gauge({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="seo-gauge">
      <svg
        viewBox="0 0 120 80"
        role="img"
        aria-label={`${label}: ${value ?? "unavailable"}`}
      >
        <path
          d="M15 65 A45 45 0 0 1 105 65"
          fill="none"
          stroke="#e0e4e8"
          strokeWidth="8"
        />
        <path
          d="M15 65 A45 45 0 0 1 105 65"
          fill="none"
          stroke={
            value === null
              ? "#d4d8de"
              : value >= 80
                ? colors[0]
                : value >= 50
                  ? colors[1]
                  : colors[2]
          }
          strokeWidth="8"
          pathLength="100"
          strokeDasharray={`${value ?? 0} 100`}
        />
        <text x="60" y="61" textAnchor="middle">
          {value ?? "—"}
        </text>
      </svg>
      <span>{label}</span>
    </div>
  );
}
function OptimizationDonut({
  value,
  counts,
}: {
  value: number | null;
  counts: number[];
}) {
  const sum = counts.reduce((a, b) => a + b, 0) || 1;
  let offset = 0;
  return (
    <div className="seo-gauge">
      <svg
        viewBox="0 0 120 120"
        role="img"
        aria-label={`Overall optimization: ${value ?? "unavailable"}`}
      >
        <circle
          cx="60"
          cy="60"
          r="42"
          stroke="#e2e4e8"
          strokeWidth="12"
          fill="none"
        />
        {counts.map((count, i) => {
          const length = (count / sum) * 100,
            start = offset;
          offset += length;
          return (
            <circle
              key={i}
              cx="60"
              cy="60"
              r="42"
              pathLength="100"
              stroke={colors[i]}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${length} ${100 - length}`}
              strokeDashoffset={-start}
              transform="rotate(-90 60 60)"
            />
          );
        })}
        <text x="60" y="68" textAnchor="middle">
          {value ?? "—"}
        </text>
      </svg>
      <span>Average SEO setup</span>
    </div>
  );
}
export function SeoTrend({
  report,
  metric,
  color = "#3479cd",
  small = false,
}: {
  report: Report;
  metric: string;
  color?: string;
  small?: boolean;
}) {
  const rows = [...report.rows].sort((a, b) => {
    const i = report.columns.indexOf("date");
    return i < 0 ? 0 : a[i].localeCompare(b[i]);
  });
  const ys = rows.map((row) => number(report, row, metric)),
    max = Math.max(...ys, 1),
    min = metric === "Average position" ? Math.min(...ys, 0) : 0;
  const points = ys.map(
    (y, i) =>
      `${12 + (i / Math.max(ys.length - 1, 1)) * 276},${90 - ((y - min) / Math.max(max - min, 1)) * 72}`,
  );
  return (
    <div className={"seo-trend " + (small ? "small" : "")}>
      <svg viewBox="0 0 300 110" role="img" aria-label={`${metric} trend`}>
        {[20, 45, 70, 90].map((y) => (
          <path key={y} d={`M12 ${y}H288`} stroke="#e8ebef" fill="none" />
        ))}
        {!!ys.length && (
          <>
            <polygon
              points={`12,90 ${points.join(" ")} 288,90`}
              fill={color}
              fillOpacity=".08"
            />
            <polyline
              points={points.join(" ")}
              stroke={color}
              strokeWidth="1.8"
              fill="none"
            />
            {points.map((p, i) => {
              const [x, y] = p.split(",");
              return (
                <circle key={i} cx={x} cy={y} r="3" fill={color} tabIndex={0}>
                  <title>{`${rows[i][report.columns.indexOf("date")] ?? rows[i][0]}: ${pretty(ys[i])}`}</title>
                </circle>
              );
            })}
          </>
        )}
        {!small && (
          <>
            <text x="12" y="12">
              {ys.length ? pretty(max) : "—"}
            </text>
            <text x="12" y="106">
              {rows[0]?.[report.columns.indexOf("date")] ?? ""}
            </text>
            <text x="288" y="106" textAnchor="end">
              {rows.at(-1)?.[report.columns.indexOf("date")] ?? ""}
            </text>
          </>
        )}
      </svg>
      {!ys.length && (
        <span>
          {report.status === "ready"
            ? "No data for this period"
            : "Connect Search Console"}
        </span>
      )}
    </div>
  );
}
function Delta({ value }: { value: number | null }) {
  return (
    <small
      className={
        value === null
          ? "seo-delta"
          : value >= 0
            ? "seo-delta positive"
            : "seo-delta negative"
      }
    >
      {value === null
        ? "—"
        : `${value >= 0 ? "▲" : "▼"} ${pretty(Math.abs(value))}`}
    </small>
  );
}
function RankingTable({
  current,
  previous,
  history,
  pages = false,
  onPage,
}: {
  current: Report;
  previous: Report;
  history?: Report;
  pages?: boolean;
  onPage?: (path: string) => void;
}) {
  return (
    <div className="analytics-table-wrap seo-ranking-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>{pages ? "Page" : "Keyword"}</th>
            <th>Impressions</th>
            <th>Clicks</th>
            <th>Position</th>
            <th>Position history</th>
          </tr>
        </thead>
        <tbody>
          {current.rows.slice(0, 20).map((row, i) => {
            const before = previous.rows.find((p) => p[0] === row[0]);
            const historyRows =
              history?.rows
                .filter((r) => r[0] === row[0])
                .map((r) => r.slice(1)) ?? [];
            return (
              <tr key={row[0]}>
                <td>{i + 1}</td>
                <td>
                  {pages ? (
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          onPage?.(new URL(row[0]).pathname);
                        } catch {
                          /* Provider returned an invalid URL. */
                        }
                      }}
                    >
                      {row[0]}
                    </button>
                  ) : (
                    row[0]
                  )}
                </td>
                {["Impressions", "Clicks", "Average position"].map((name) => (
                  <td key={name}>
                    {pretty(number(current, row, name))}{" "}
                    <Delta
                      value={
                        before
                          ? (name === "Average position" ? -1 : 1) *
                            (number(current, row, name) -
                              number(previous, before, name))
                          : null
                      }
                    />
                  </td>
                ))}
                <td>
                  {history ? (
                    <SeoTrend
                      small
                      report={{
                        ...history,
                        columns: history.columns.slice(1),
                        rows: historyRows,
                      }}
                      metric="Average position"
                    />
                  ) : (
                    <span className="analytics-note">Not collected</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!current.rows.length && (
        <p className="analytics-empty">
          {current.status === "ready"
            ? "No results for this period."
            : "Search Console reporting is not connected."}
        </p>
      )}
    </div>
  );
}
export function SeoPerformanceDashboard({
  reports,
  path,
  onPath,
  tab,
  onTab,
}: {
  reports: SeoReports;
  path: string;
  onPath: (path: string) => void;
  tab: string;
  onTab: (tab: string) => void;
}) {
  const [summary, setSummary] = useState<{
      pages: PageSeo[];
      indexingEnabled: boolean;
    } | null>(null),
    [error, setError] = useState(""),
    [search, setSearch] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/seo-summary", { signal: controller.signal })
      .then(async (r) => {
        const result = await r.json();
        if (!r.ok) throw Error(result.error);
        setSummary(result);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(String(e));
      });
    return () => controller.abort();
  }, []);
  const selected = summary?.pages.find((p) => p.path === path),
    scored = summary?.pages.filter((p) => p.score !== null) ?? [];
  const average = scored.length
    ? Math.round(scored.reduce((s, p) => s + p.score!, 0) / scored.length)
    : null;
  const distribution = [
    scored.filter((p) => p.score! >= 80).length,
    scored.filter((p) => p.score! >= 50 && p.score! < 80).length,
    scored.filter((p) => p.score! < 50).length,
    (summary?.pages.length ?? 0) - scored.length,
  ];
  const imp = total(reports.gscTrend, "Impressions"),
    clicks = total(reports.gscTrend, "Clicks"),
    weight = imp
      ? reports.gscTrend.rows.reduce(
          (s, r) =>
            s +
            number(reports.gscTrend, r, "Average position") *
              number(reports.gscTrend, r, "Impressions"),
          0,
        ) / imp
      : null;
  const metrics = [
    ["Search traffic", clicks, "Clicks"],
    ["Search impressions", imp, "Impressions"],
    ["Returned keywords", reports.gscQueries.rows.length, ""],
    ["Avg. position", weight, "Average position"],
    ...(selected
      ? ([
          ["Search clicks", clicks, "Clicks"],
          ["CTR", imp ? (clicks / imp) * 100 : null, ""],
        ] as const)
      : []),
  ] as const;
  const ready = reports.gscTrend.status === "ready";
  const changes = reports.gscQueries.rows.flatMap((row) => {
    const old = reports.previousQueries.rows.find((r) => r[0] === row[0]);
    return old
      ? [
          {
            name: row[0],
            position: number(reports.gscQueries, row, "Average position"),
            change:
              number(reports.previousQueries, old, "Average position") -
              number(reports.gscQueries, row, "Average position"),
          },
        ]
      : [];
  });
  const buckets = [
    reports.gscQueries.rows.filter(
      (r) => number(reports.gscQueries, r, "Average position") <= 3,
    ).length,
    reports.gscQueries.rows.filter(
      (r) =>
        number(reports.gscQueries, r, "Average position") > 3 &&
        number(reports.gscQueries, r, "Average position") <= 10,
    ).length,
    reports.gscQueries.rows.filter(
      (r) =>
        number(reports.gscQueries, r, "Average position") > 10 &&
        number(reports.gscQueries, r, "Average position") <= 50,
    ).length,
  ];
  const scoreCard = (
    <article className="analytics-card seo-score-card">
      <h3>{selected ? "SEO score" : "Overall optimization"}</h3>
      {selected ? (
        <div className="seo-two-gauges">
          <Gauge value={selected.contentScore} label="Content setup" />
          <Gauge value={selected.score} label="SEO setup" />
        </div>
      ) : (
        <div className="seo-overall">
          <OptimizationDonut value={average} counts={distribution} />
          <dl>
            {["Good", "Fair", "Poor", "No data"].map((label, i) => (
              <div key={label}>
                <dt>
                  <i style={{ backgroundColor: colors[i] }} />
                  {label}
                </dt>
                <dd>{distribution[i]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      <p className="analytics-note">
        CODEYEA editorial checklist, calculated from saved drafts. These are
        setup scores, not Google rankings or Rank Math scores.
      </p>
      <button type="button" onClick={() => onTab("SEO Performance")}>
        Open report
      </button>
    </article>
  );
  const stats = (
    <article
      className={
        "analytics-card seo-spark-grid " + (selected ? "page-metrics" : "")
      }
    >
      {metrics.map(([label, value, metric]) => (
        <div key={label}>
          <h3>{label}</h3>
          <strong>
            {ready && value !== null
              ? pretty(value) + (label === "CTR" ? "%" : "")
              : "—"}
          </strong>
          {metric ? (
            <SeoTrend small report={reports.gscTrend} metric={metric} />
          ) : (
            <p className="analytics-note">
              {label === "CTR"
                ? "Clicks ÷ impressions for the selected period."
                : "Top returned query rows; Google may withhold queries."}
            </p>
          )}
        </div>
      ))}
    </article>
  );
  return (
    <div className="seo-reference-dashboard">
      {error && <p role="alert">{error}</p>}
      <div className="seo-page-filter">
        <label>
          Search page URL
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages…"
          />
        </label>
        <label>
          Page
          <select value={path} onChange={(e) => onPath(e.target.value)}>
            <option value="">All pages</option>
            {summary?.pages
              .filter(
                (p) =>
                  p.path.includes(search) ||
                  p.title.toLowerCase().includes(search.toLowerCase()) ||
                  p.path === path,
              )
              .map((p) => (
                <option key={p.id} value={p.path}>
                  {p.title} · {p.path}
                </option>
              ))}
          </select>
        </label>
      </div>
      {["Dashboard", "SEO Performance"].includes(tab) && (
        <>
          <div className="analytics-columns">
            {scoreCard}
            {selected ? (
              <article className="analytics-card seo-primary-keyword">
                <h3>Primary keyword</h3>
                <strong>{selected.focusPhrase || "Not set"}</strong>
                <p>Page · {selected.path}</p>
                <p>Publication · {selected.status}</p>
                <a href={selected.editor}>Edit page and Google preview</a>
              </article>
            ) : (
              stats
            )}
          </div>
          {selected && (
            <>
              <SeoPageInspection
                path={selected.path}
                indexAllowed={selected.indexAllowed}
                indexingEnabled={summary?.indexingEnabled ?? false}
              />
              <div className="analytics-columns">
                <article className="analytics-card">
                  <h3>Suggested changes</h3>
                  <ul className="seo-check-list">
                    {[...selected.checks, ...selected.contentChecks].map(
                      (c) => (
                        <li key={c.label} className={c.passed ? "passed" : ""}>
                          <span>{c.passed ? "✓" : "○"}</span>
                          {c.label}
                        </li>
                      ),
                    )}
                  </ul>
                </article>
                <article className="analytics-card">
                  <h3>Search trend</h3>
                  <SeoTrend report={reports.gscTrend} metric="Clicks" />
                </article>
              </div>
              {stats}
            </>
          )}
          {!selected && (
            <div className="analytics-columns">
              <article className="analytics-card">
                <h3>Winning and losing keywords</h3>
                <div className="seo-winners">
                  {[true, false].map((winning) => (
                    <div key={String(winning)}>
                      <h4>
                        {winning
                          ? "Top winning keywords"
                          : "Top losing keywords"}
                      </h4>
                      {changes
                        .filter((c) => (winning ? c.change > 0 : c.change < 0))
                        .sort((a, b) =>
                          winning ? b.change - a.change : a.change - b.change,
                        )
                        .slice(0, 5)
                        .map((c) => (
                          <p key={c.name}>
                            <span>{c.name}</span>
                            <b>{pretty(c.position)}</b>
                            <Delta value={c.change} />
                          </p>
                        ))}
                    </div>
                  ))}
                </div>
                {!changes.length && (
                  <p className="analytics-empty">
                    Connect Search Console to compare positions against the
                    preceding period.
                  </p>
                )}
              </article>
              <article className="analytics-card">
                <h3>Keyword positions</h3>
                <div className="seo-position-bars">
                  {["Top 3 positions", "4–10 positions", "11–50 positions"].map(
                    (label, i) => (
                      <div key={label}>
                        <span>{label}</span>
                        <strong>{ready ? pretty(buckets[i]) : "—"}</strong>
                        <div
                          style={{
                            height: `${ready ? Math.max(2, (buckets[i] / Math.max(...buckets, 1)) * 110) : 2}px`,
                            backgroundColor: ["#2d5794", "#3975ca", "#6298dd"][
                              i
                            ],
                          }}
                        />
                      </div>
                    ),
                  )}
                </div>
                <p className="analytics-note">
                  Current average positions among returned queries · Average CTR{" "}
                  {ready && imp ? pretty((clicks / imp) * 100) + "%" : "—"}
                </p>
              </article>
            </div>
          )}
        </>
      )}
      {tab === "Index Status" && (
        <article className="analytics-card analytics-wide">
          <h3>Page indexing settings</h3>
          <div className="analytics-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Publication</th>
                  <th>Index setting</th>
                  <th>Google status</th>
                </tr>
              </thead>
              <tbody>
                {summary?.pages
                  .filter((p) => !path || p.path === path)
                  .map((p) => (
                    <tr key={p.id}>
                      <td>
                        <a href={p.editor}>{p.title}</a>
                      </td>
                      <td>{p.status}</td>
                      <td>
                        {p.indexAllowed ? "Allowed" : "Noindex"}
                        {!summary.indexingEnabled
                          ? " · site indexing disabled"
                          : ""}
                      </td>
                      <td>Not inspected</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </article>
      )}
      {["Dashboard", "SEO Performance"].includes(tab) && (
        <article className="analytics-card analytics-wide">
          <h3>Top performing pages</h3>
          <RankingTable
            current={reports.gscPages}
            previous={reports.previousPages}
            history={reports.pageHistory}
            pages
            onPage={onPath}
          />
        </article>
      )}
      {(["Keywords", "Rank Tracker", "SEO Performance"].includes(tab) ||
        (!!selected && tab === "Dashboard")) && (
        <article className="analytics-card analytics-wide">
          <h3>Ranking keywords</h3>
          <RankingTable
            current={reports.gscQueries}
            previous={reports.previousQueries}
            history={reports.queryHistory}
          />
          <p className="analytics-note">
            Position history uses daily Search Console averages. Changes compare
            equal preceding periods; missing comparison data stays “—”.
          </p>
        </article>
      )}
    </div>
  );
}
