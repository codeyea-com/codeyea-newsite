import type { Audit } from "./types";
import { formatDate } from "./format-date";

function flatten(value: unknown, path = ""): Record<string, string> {
  if (value === null || value === undefined)
    return { [path || "Record"]: "(empty)" };
  if (typeof value !== "object") return { [path || "Value"]: String(value) };
  const entries = Object.entries(value);
  if (!entries.length)
    return { [path || "Record"]: Array.isArray(value) ? "[]" : "{}" };
  return Object.assign(
    {},
    ...entries.map(([key, child]) =>
      flatten(child, path ? `${path}.${key}` : key),
    ),
  );
}
function Changes({ entry }: { entry: Audit }) {
  const before = flatten(entry.before),
    after = flatten(entry.after);
  const fields = [
    ...new Set([...Object.keys(before), ...Object.keys(after)]),
  ].filter((key) => before[key] !== after[key]);
  return (
    <details className="audit-changes">
      <summary>View changes ({fields.length})</summary>
      {fields.length ? (
        <table>
          <caption className="sr-only">Before and after values</caption>
          <thead>
            <tr>
              <th>Field</th>
              <th>Before</th>
              <th>After</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((key) => (
              <tr key={key}>
                <th scope="row">{key}</th>
                <td>{before[key] ?? "(absent)"}</td>
                <td>{after[key] ?? "(absent)"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No value changes recorded.</p>
      )}
    </details>
  );
}
export function Activity({ audit }: { audit: Audit[] }) {
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">Content activity</caption>
        <thead>
          <tr>
            <th>Activity / affected record</th>
            <th>Actor</th>
            <th>Date</th>
            <th>Changes</th>
          </tr>
        </thead>
        <tbody>
          {audit.map((entry) => (
            <tr key={entry.id}>
              <td>
                {entry.action.replace(/[._]/g, " ")}
                <div className="small">
                  {entry.entityType || "Record"}: {entry.entityId}
                </div>
              </td>
              <td>
                {entry.actor?.name ||
                  entry.actorLabel ||
                  (entry.actorKind === "OPERATOR"
                    ? "Operator"
                    : entry.actorKind === "USER"
                      ? "Former user"
                      : "System")}
                <div className="small">{entry.actorKind || "USER"}</div>
              </td>
              <td>{formatDate(entry.createdAt)}</td>
              <td>
                <Changes entry={entry} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!audit.length && (
        <p className="feedback">No activity is available for your account.</p>
      )}
    </div>
  );
}
