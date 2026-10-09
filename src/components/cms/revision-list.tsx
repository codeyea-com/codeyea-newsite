"use client";
import { useEffect, useState } from "react";
import type { Page, Revision } from "./types";
import { resolveHomepage } from "@/content/homepage-defaults";
import { formatDate } from "./format-date";
import { homepageEditorSections, type Field } from "@/schemas/homepage-editor";

export function RevisionList({
  revisions,
  draft,
  busy,
  canRestore,
  onRestore,
  nextVersion,
  onLoadMore,
  loadingMore,
}: {
  revisions: Revision[];
  draft: Page;
  busy: boolean;
  canRestore: boolean;
  onRestore: (revision: Revision) => void;
  nextVersion: number | null;
  onLoadMore: () => void;
  loadingMore: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (selectedId) document.getElementById("revision-preview")?.focus();
  }, [selectedId]);
  const selected = revisions.find((item) => item.id === selectedId);
  const compared = selected
    ? [
        {
          label: "Page title",
          current: draft.title,
          previous: selected.snapshot.title,
        },
        ...selected.snapshot.sections.flatMap((section) => {
          const current = draft.sections.find((item) => item.id === section.id);
          return [
            {
              label: `${sectionLabel(section.type)}: heading`,
              current: current?.heading ?? "",
              previous: section.heading,
            },
            {
              label: `${sectionLabel(section.type)}: supporting copy`,
              current: current?.body ?? "",
              previous: section.body,
            },
          ];
        }),
        ...draft.sections
          .filter(
            (section) =>
              !selected.snapshot.sections.some(
                (item) => item.id === section.id,
              ),
          )
          .flatMap((section) => [
            {
              label: `${sectionLabel(section.type)}: heading (section removed)`,
              current: section.heading,
              previous: "",
            },
            {
              label: `${sectionLabel(section.type)}: supporting copy (section removed)`,
              current: section.body,
              previous: "",
            },
          ]),
        ...(draft.servicesPage ? compareAbout(draft.servicesPage, selected.snapshot.servicesPage, "Services") : Boolean(draft.industryDetail) ? compareAbout(draft.industryDetail, selected.snapshot.industryDetail, draft.title) : draft.id === "industries" ? compareAbout(draft.industriesPage, selected.snapshot.industriesPage, "Industries") : draft.id === "about"
          ? compareAbout(draft.about, selected.snapshot.about)
          : compareHomepage(draft.homepage, selected.snapshot.homepage)),
      ]
    : [];
  const changes = compared.filter((item) => item.current !== item.previous);
  const unchanged = compared.filter((item) => item.current === item.previous);
  return (
    <div className="records">
      {revisions.length ? (
        revisions.map((revision) => (
          <article className="revision" key={revision.id}>
            <div>
              <h2>Version {revision.version}</h2>
              <p>{revision.snapshot.title}</p>
              <span className="small">
                {formatDate(revision.createdAt)} · {revision.reason}
              </span>
            </div>
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => setSelectedId(revision.id)}
              aria-expanded={selectedId === revision.id}
              aria-controls="revision-preview"
            >
              Preview version {revision.version}
            </button>
          </article>
        ))
      ) : (
        <p>No revisions yet. Save a draft to record its first revision.</p>
      )}
      {nextVersion !== null && (
        <button
          className="button secondary load-more"
          onClick={onLoadMore}
          disabled={loadingMore || busy}
        >
          {loadingMore ? "Loading older revisions…" : "Load older revisions"}
        </button>
      )}
      <div id="revision-preview" tabIndex={-1}>
        {selected && (
          <section
            className="revision-preview"
            aria-label={`Preview revision ${selected.version}`}
          >
            <div className="section-heading">
              <h2>Preview version {selected.version}</h2>
              <button
                className="quiet-link"
                onClick={() => setSelectedId(null)}
              >
                Close preview
              </button>
            </div>
            <p>
              Compare this revision with your current draft, including any
              unsaved changes. Restoring creates a new draft version; published
              content stays unchanged.
            </p>
            {changes.length ? (
              <div className="comparison-table">
                <table>
                  <caption>
                    Changes if version {selected.version} is restored
                  </caption>
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Current draft</th>
                      <th>Selected revision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((item) => (
                      <tr key={item.label + changes.indexOf(item)}>
                        <th scope="row">{item.label}</th>
                        <td>{item.current || "(empty)"}</td>
                        <td>{item.previous || "(empty)"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>
                The selected revision has the same content as your current
                draft.
              </p>
            )}
            <details className="revision-copy">
              <summary>{unchanged.length} unchanged fields</summary>
              <dl>
                {unchanged.map((item, index) => (
                  <div key={index}>
                    <dt>{item.label}</dt>
                    <dd>{item.current || "(empty)"}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <details className="revision-copy">
              <summary>Read complete revision content</summary>
              <dl>
                {compared.map((item, index) => (
                  <div key={index}>
                    <dt>{item.label}</dt>
                    <dd>{item.previous || "(empty)"}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <details className="revision-copy cms-recovery-snapshot">
              <summary>Recovery details: original full snapshot</summary>
              <p className="small">
                Technical snapshot retained for recovery, including stable item
                identifiers.
              </p>
              <pre>{JSON.stringify(selected.snapshot, null, 2)}</pre>
            </details>
            <button
              className="button"
              disabled={busy || !canRestore}
              onClick={() => onRestore(selected)}
              aria-label={`Restore revision ${selected.version}`}
            >
              Restore revision {selected.version} as draft
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

const sectionLabel = (key: string) =>
  homepageEditorSections.find((section) => section.key === key)?.label ??
  humanize(key);
const humanize = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
type FlatField = { label: string; value: string };
function flattenHomepage(value: unknown) {
  const output: Record<string, FlatField> = {};
  const walk = (
    node: unknown,
    key: string,
    label: string,
    fields: Field[] = [],
  ) => {
    if (Array.isArray(node)) {
      node.forEach((item, index) => {
        const record = item as Record<string, unknown>;
        const name = String(
          record.title || record.value || "Item " + (index + 1),
        );
        walk(
          item,
          key + "/" + String(record.id ?? index),
          label + " / " + name,
          fields,
        );
      });
    } else if (node && typeof node === "object") {
      for (const [name, child] of Object.entries(node)) {
        if (["id", "localeId", "marketId", "schemaVersion"].includes(name))
          continue;
        const metadata = fields.find((field) => field.key === name);
        const section = homepageEditorSections.find(
          (section) => section.key === name,
        );
        const known: Record<string, string> = {
          enabled: "Visibility",
          position: "Order",
          mediaId: "Image",
          alt: "Image alt text",
          decorative: "Decorative image",
          focalX: "Horizontal focal position",
          focalY: "Vertical focal position",
        };
        const fieldLabel =
          metadata?.label ?? section?.label ?? known[name] ?? humanize(name);
        walk(
          child,
          key ? key + "/" + name : name,
          label ? label + " / " + fieldLabel : fieldLabel,
          metadata?.fields ?? section?.fields ?? [],
        );
      }
    } else {
      const last = key.split("/").at(-1);
      const rendered =
        last === "enabled"
          ? node
            ? "Visible"
            : "Hidden"
          : last === "position"
            ? String(Number(node) + 1)
            : typeof node === "boolean"
              ? node
                ? "Yes"
                : "No"
              : String(node ?? "");
      output[key] = { label, value: rendered };
    }
  };
  walk(value, "", "");
  return output;
}
function compareHomepage(current: unknown, previous: unknown) {
  const now = flattenHomepage(resolveHomepage(current)),
    then = flattenHomepage(resolveHomepage(previous));
  return [...new Set([...Object.keys(now), ...Object.keys(then)])].map(
    (key) => ({
      label: then[key]?.label ?? now[key].label,
      current: now[key]?.value ?? "(removed)",
      previous: then[key]?.value ?? "(new item)",
    }),
  );
}
function compareAbout(current: unknown, previous: unknown, pageLabel="About") {
  const flatten = (content: unknown) => {
    const output: Record<string, FlatField> = {};
    const walk = (node: unknown, path: string, label: string) => {
      if (Array.isArray(node)) {
        node.forEach((entry, index) => {
          if (entry && typeof entry === "object") {
            const item = entry as Record<string, unknown>;
            walk(
              item,
              path + "/" + String(item.id ?? index),
              label +
                " / " +
                String(
                  item.title ||
                    item.label ||
                    item.type ||
                    "Item " + (index + 1),
                ),
            );
          } else walk(entry, path + "/" + index, label + " / " + (index + 1));
        });
      } else if (node && typeof node === "object") {
        for (const [key, value] of Object.entries(node)) {
          if (
            [
              "id",
              "schemaVersion",
              "localeId",
              "marketId",
              "sharedSourcePageId",
            ].includes(key)
          )
            continue;
          walk(
            value,
            path + "/" + key,
            label ? label + " / " + humanize(key) : humanize(key),
          );
        }
      } else
        output[path] = {
          label,
          value: path.endsWith("/enabled")
            ? node
              ? "Enabled"
              : "Hidden"
            : path.endsWith("/position")
              ? String(Number(node) + 1)
              : typeof node === "boolean"
                ? node
                  ? "Yes"
                  : "No"
                : String(node ?? ""),
        };
    };
    walk(content, "", pageLabel);
    return output;
  };
  const now = flatten(current),
    then = flatten(previous);
  return [...new Set([...Object.keys(now), ...Object.keys(then)])].map(
    (key) => ({
      label: then[key]?.label ?? now[key].label,
      current: now[key]?.value ?? "(removed)",
      previous: then[key]?.value ?? "(new item)",
    }),
  );
}
