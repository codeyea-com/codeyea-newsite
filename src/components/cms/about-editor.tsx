"use client";
import { useEffect, useState, type FormEvent } from "react";
import {
  aboutSchema,
  type AboutContent,
  type AboutSection,
  type AboutMedia,
} from "@/schemas/about";
import { MediaPicker } from "./media-picker";
import { assetUrl } from "@/content/homepage-assets";
import type { Page } from "./types";
type Props = {
  approvedProjects?: { id: string; title: string }[];
  draft: Page;
  dirty: boolean;
  busy: boolean;
  canEdit: boolean;
  canPublish: boolean;
  onPublish: () => void;
  onChange: (page: Page) => void;
  onSave: (event: FormEvent) => void;
};
const names: Record<string, string> = {
  hero: "Hero",
  who: "Who we are",
  point: "Our point of view",
  principles: "Principles",
  capabilities: "Capabilities",
  process: "Process",
  markets: "Markets",
  partnership: "Partnership",
  selectedWork: "Selected work",
  cta: "Call to action",
  experience: "Experience — reference",
  projectReference: "Project image — static reference",
  showcase: "Service showcase",
  awards: "Awards — temporary reference copy",
};
function move<T extends { position: number }>(
  items: T[],
  from: number,
  to: number,
) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next.map((entry, position) => ({ ...entry, position }));
}
export function AboutEditor({
  approvedProjects = [],
  draft,
  dirty,
  busy,
  canEdit,
  canPublish,
  onPublish,
  onChange,
  onSave,
}: Props) {
  const about = draft.about!;
  const [selected, setSelected] = useState(about.sections[0]?.id);
  const [preview, setPreview] = useState(false);
  const [width, setWidth] = useState(1440);
  const [error, setError] = useState("");
  useEffect(() => {
    if (dirty) setPreview(false);
  }, [dirty]);
  const update = (next: AboutContent) => onChange({ ...draft, about: next });
  const section =
    about.sections.find((s) => s.id === selected) ?? about.sections[0];
  const change = (next: AboutSection) =>
    update({
      ...about,
      sections: about.sections.map((s) => (s.id === next.id ? next : s)),
    });
  function submit(event: FormEvent) {
    const parsed = aboutSchema.safeParse(about);
    if (!parsed.success) {
      event.preventDefault();
      setError(
        parsed.error.issues
          .map((i) => i.path.join(".") + ": " + i.message)
          .join(" · "),
      );
      return;
    }
    setError("");
    onSave(event);
  }
  return (
    <form onSubmit={submit}>
      <div className="editor-toolbar cms-sticky">
        <strong>
          {dirty
            ? "Unsaved changes — save before preview or publishing"
            : draft.hasUnpublishedChanges
              ? "Draft saved with unpublished changes"
              : "Published"}
        </strong>
        <div className="cms-actions">
          <button className="button" disabled={busy || !canEdit || !dirty}>
            Save draft
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={busy || dirty}
            onClick={() => setPreview((v) => !v)}
          >
            Preview
          </button>
          {canPublish && (
            <button
              type="button"
              className="button secondary"
              disabled={busy || dirty || !draft.hasUnpublishedChanges}
              onClick={onPublish}
            >
              Publish
            </button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="feedback error">
          {error}
        </p>
      )}
      {!canEdit && (
        <p className="feedback">
          Your role can review content. Editing requires additional access.
        </p>
      )}
      {preview && (
        <section className="cms-preview" aria-label="Saved About draft preview">
          <div className="cms-actions">
            {[
              ["Desktop", 1440],
              ["Tablet", 768],
              ["Mobile", 390],
            ].map(([name, size]) => (
              <button
                key={name}
                type="button"
                aria-pressed={width === size}
                onClick={() => setWidth(Number(size))}
              >
                {name}
              </button>
            ))}
            <a href="/preview/about" target="_blank" rel="noopener">
              Open private draft preview
            </a>
            <button type="button" onClick={() => setPreview(false)}>
              Close preview
            </button>
          </div>
          <p>Saved draft only. Changes are private until Publish.</p>
          <div className="cms-preview-scroll">
            <iframe
              key={draft.version}
              title="Complete private About preview"
              src="/preview/about"
              style={{ width, height: 800 }}
            />
          </div>
        </section>
      )}
      <div className="editor-grid cms-homepage-editor">
        <nav className="section-list" aria-label="About sections">
          <h2>About sections</h2>
          <button
            type="button"
            className={"section-item " + (selected === "seo" ? "selected" : "")}
            onClick={() => setSelected("seo")}
          >
            Page and search details
          </button>
          {about.sections.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={
                "section-item " + (selected === s.id ? "selected" : "")
              }
              onClick={() => setSelected(s.id)}
              aria-current={selected === s.id ? "true" : undefined}
            >
              <span className="section-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                {names[s.type]}
                <small>
                  {s.enabled ? "Visible" : "Hidden"} · {s.visibility}
                </small>
              </span>
            </button>
          ))}
        </nav>
        <section className="editor-fields">
          <h2>
            {selected === "seo"
              ? "Page and search details"
              : names[section.type]}
          </h2>
          <p className="small">
            CODEYEA brand, shared header and footer, layout and breakpoints are
            protected. Content changes apply to About only.
          </p>
          <fieldset className="cms-fields" disabled={!canEdit || busy}>
            {selected === "seo" ? (
              <>
                <Text
                  label="Page title"
                  value={draft.title}
                  max={120}
                  change={(title) => onChange({ ...draft, title })}
                />
                <Text
                  label="Search title"
                  value={about.seo.title}
                  max={120}
                  change={(title) =>
                    update({ ...about, seo: { ...about.seo, title } })
                  }
                />
                <Text
                  label="Search description"
                  value={about.seo.description}
                  max={320}
                  multiline
                  change={(description) =>
                    update({ ...about, seo: { ...about.seo, description } })
                  }
                />
              </>
            ) : (
              <>
                <div className="cms-actions">
                  <button
                    type="button"
                    disabled={about.sections.indexOf(section) === 0}
                    onClick={() =>
                      update({
                        ...about,
                        sections: move(
                          about.sections,
                          about.sections.indexOf(section),
                          about.sections.indexOf(section) - 1,
                        ),
                      })
                    }
                  >
                    Move section up
                  </button>
                  <button
                    type="button"
                    disabled={
                      about.sections.indexOf(section) ===
                      about.sections.length - 1
                    }
                    onClick={() =>
                      update({
                        ...about,
                        sections: move(
                          about.sections,
                          about.sections.indexOf(section),
                          about.sections.indexOf(section) + 1,
                        ),
                      })
                    }
                  >
                    Move section down
                  </button>
                  <label>
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      disabled={
                        section.type === "selectedWork" &&
                        !section.projectIds?.length
                      }
                      onChange={(e) =>
                        change({ ...section, enabled: e.target.checked })
                      }
                    />{" "}
                    Section enabled
                  </label>
                </div>
                <label className="field-label">
                  Device visibility
                  <select
                    aria-label="Device visibility"
                    value={section.visibility}
                    onChange={(e) =>
                      change({
                        ...section,
                        visibility: e.target
                          .value as AboutSection["visibility"],
                      })
                    }
                  >
                    <option value="all">All devices</option>
                    <option value="desktop">Desktop only</option>
                    <option value="tablet">Tablet only</option>
                    <option value="mobile">Mobile only</option>
                  </select>
                </label>
                <p className="small">
                  A device-only choice hides this section on every other device
                  size. Disabled sections stay hidden everywhere.
                </p>
                {(!["hero", "selectedWork", "showcase"].includes(section.type) || (section.type === "showcase" && !section.items.length)) && (
                  <Text
                    label="Section label"
                    value={section.label}
                    max={100}
                    change={(label) => change({ ...section, label })}
                  />
                )}
                {(section.type !== "showcase" || !section.items.length) && <Text
                  label="Heading"
                  value={section.heading}
                  max={240}
                  change={(heading) => change({ ...section, heading })}
                />}
                {section.type === "hero" && (
                  <p className="small">CODEYEA brand text is locked.</p>
                )}
                {(!["hero", "principles", "selectedWork", "showcase"].includes(
                  section.type,
                ) || (section.type === "showcase" && !section.items.length)) && (
                  <Text
                    label="Supporting copy"
                    value={section.body}
                    max={5000}
                    multiline
                    change={(body) => change({ ...section, body })}
                  />
                )}
                {section.type === "who" && about.schemaVersion === 1 && (
                  <Text
                    label="Positioning statement"
                    value={section.positioning ?? ""}
                    max={5000}
                    multiline
                    change={(positioning) =>
                      change({ ...section, positioning })
                    }
                  />
                )}
                {(["hero", "who", "experience", "projectReference"].includes(section.type) || (section.type === "showcase" && !section.items.length)) && (
                  <AboutImage
                    value={section.media}
                    change={(media) => change({ ...section, media })}
                  />
                )}
                {(["cta", "experience"].includes(section.type) || (section.type === "showcase" && !section.items.length)) && (
                  <>
                    <Text
                      label={section.type === "experience" ? "Image caption" : "Button label"}
                      value={section.ctaLabel ?? ""}
                      max={80}
                      change={(ctaLabel) => change({ ...section, ctaLabel })}
                    />
                    <p className="small">
                      {section.type === "cta" ? "The button uses the existing shared footer destination." : section.type === "experience" ? "Static vertical image caption." : "Static reference presentation; destination behavior is deferred."}
                    </p>
                  </>
                )}
                {section.type === "showcase" && <section className="cms-collection">
                  <h3>Showcase — {section.items.length} fixed slides</h3>
                  <p className="small">Edit each slide below. Stable identities and the approved order are locked. Button destinations remain deferred.</p>
                  {section.items.map((item,index)=>{
                    const update=(patch:Partial<typeof item>)=>change({...section,items:section.items.map(i=>i.id===item.id?{...i,...patch}:i)});
                    return <details className="cms-collection-item" key={item.id}>
                      <summary>{index+1}. {item.title}</summary>
                      <div className="cms-item-fields">
                        <Text label="Slide heading" value={item.title} max={180} change={title=>update({title})}/>
                        <Text label="Slide kicker" value={item.label??""} max={100} change={label=>update({label})}/>
                        <Text label="Slide copy" value={item.body} max={3000} multiline change={body=>update({body})}/>
                        <Text label="Slide button label" value={item.ctaLabel??""} max={80} change={ctaLabel=>update({ctaLabel})}/>
                        <AboutImage value={item.media} change={media=>update({media})}/>
                      </div>
                    </details>;
                  })}
                  {!section.items.length&&<p>This saved revision predates the Showcase collection.</p>}
                </section>}
                {section.type === "selectedWork" ? (
                  <section className="cms-collection">
                    <h3>Approved project references</h3>
                    <p className="small">
                      Only owner-approved real work is available. Selection and
                      ordering apply to About only. Select a project before
                      enabling this section.
                    </p>
                    {!approvedProjects.length && (
                      <p>
                        No approved projects are available. Selected work stays
                        hidden.
                      </p>
                    )}
                    {(section.projectIds ?? []).map((id, index) => (
                      <div className="cms-actions" key={id}>
                        <span>
                          {approvedProjects.find((p) => p.id === id)?.title ??
                            "Project no longer approved"}
                        </span>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            const ids = [...section.projectIds!];
                            [ids[index - 1], ids[index]] = [
                              ids[index],
                              ids[index - 1],
                            ];
                            change({ ...section, projectIds: ids });
                          }}
                        >
                          Move project up
                        </button>
                        <button
                          type="button"
                          disabled={index === section.projectIds!.length - 1}
                          onClick={() => {
                            const ids = [...section.projectIds!];
                            [ids[index + 1], ids[index]] = [
                              ids[index],
                              ids[index + 1],
                            ];
                            change({ ...section, projectIds: ids });
                          }}
                        >
                          Move project down
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const ids = section.projectIds!.filter(
                              (p) => p !== id,
                            );
                            change({
                              ...section,
                              projectIds: ids,
                              enabled: ids.length > 0 && section.enabled,
                            });
                          }}
                        >
                          Remove project
                        </button>
                      </div>
                    ))}
                    {approvedProjects
                      .filter((p) => !section.projectIds?.includes(p.id))
                      .map((project) => (
                        <button
                          type="button"
                          key={project.id}
                          disabled={(section.projectIds?.length ?? 0) >= 12}
                          onClick={() =>
                            change({
                              ...section,
                              projectIds: [
                                ...(section.projectIds ?? []),
                                project.id,
                              ],
                            })
                          }
                        >
                          Add {project.title}
                        </button>
                      ))}
                  </section>
                ) : ["principles", "capabilities", "process", "experience", "projectReference", "awards"].includes(
                    section.type,
                  ) ? (
                  <section className="cms-collection">
                    <h3>Items</h3>
                    {section.items.map((item, index) => (
                      <details className="cms-collection-item" key={item.id}>
                        <summary>
                          {index + 1}. {item.title || "Untitled item"} ·{" "}
                          {item.enabled ? "Visible" : "Hidden"}
                        </summary>
                        <div className="cms-item-fields">
                          <div className="cms-actions">
                            <button
                              type="button"
                              disabled={!index}
                              onClick={() =>
                                change({
                                  ...section,
                                  items: move(section.items, index, index - 1),
                                })
                              }
                            >
                              Move item up
                            </button>
                            <button
                              type="button"
                              disabled={index === section.items.length - 1}
                              onClick={() =>
                                change({
                                  ...section,
                                  items: move(section.items, index, index + 1),
                                })
                              }
                            >
                              Move item down
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Remove this item from the draft? Saved revisions retain its history.",
                                  )
                                )
                                  change({
                                    ...section,
                                    items: section.items
                                      .filter((i) => i.id !== item.id)
                                      .map((i, position) => ({
                                        ...i,
                                        position,
                                      })),
                                  });
                              }}
                            >
                              Remove item
                            </button>
                            <label>
                              <input
                                type="checkbox"
                                checked={item.enabled}
                                onChange={(e) =>
                                  change({
                                    ...section,
                                    items: section.items.map((i) =>
                                      i.id === item.id
                                        ? { ...i, enabled: e.target.checked }
                                        : i,
                                    ),
                                  })
                                }
                              />{" "}
                              Item enabled
                            </label>
                          </div>
                          <Text
                            label="Item title"
                            value={item.title}
                            max={180}
                            change={(title) =>
                              change({
                                ...section,
                                items: section.items.map((i) =>
                                  i.id === item.id ? { ...i, title } : i,
                                ),
                              })
                            }
                          />
                          <Text
                            label="Item copy"
                            value={item.body}
                            max={3000}
                            multiline
                            change={(body) =>
                              change({
                                ...section,
                                items: section.items.map((i) =>
                                  i.id === item.id ? { ...i, body } : i,
                                ),
                              })
                            }
                          />
                          {section.type === "capabilities" && (
                            <AboutImage
                              value={item.media}
                              change={(media) =>
                                change({
                                  ...section,
                                  items: section.items.map((i) =>
                                    i.id === item.id ? { ...i, media } : i,
                                  ),
                                })
                              }
                            />
                          )}
                        </div>
                      </details>
                    ))}
                    <button
                      type="button"
                      disabled={
                        section.items.length >=
                        (section.type === "experience" ? 2 : ["principles", "awards"].includes(section.type) ? 3 : 4)
                      }
                      onClick={() =>
                        change({
                          ...section,
                          items: [
                            ...section.items,
                            {
                              id: crypto.randomUUID(),
                              position: section.items.length,
                              enabled: true,
                              title: "",
                              body: "",
                            },
                          ],
                        })
                      }
                    >
                      Add item
                    </button>
                    <p className="small">
                      Up to {section.type === "experience" ? 2 : ["principles", "awards"].includes(section.type) ? 3 : 4} items.
                      Reordering preserves item identity.
                    </p>
                  </section>
                ) : null}
              </>
            )}
          </fieldset>
        </section>
      </div>
    </form>
  );
}
function Text({
  label,
  value,
  change,
  max,
  multiline = false,
}: {
  label: string;
  value: string;
  change: (v: string) => void;
  max: number;
  multiline?: boolean;
}) {
  return (
    <label className="field-label">
      {label}
      {multiline ? (
        <textarea
          aria-label={label}
          rows={5}
          value={value}
          maxLength={max}
          onChange={(e) => change(e.target.value)}
        />
      ) : (
        <input
          aria-label={label}
          value={value}
          maxLength={max}
          onChange={(e) => change(e.target.value)}
        />
      )}
    </label>
  );
}
function AboutImage({
  value,
  change,
}: {
  value?: AboutMedia;
  change: (v: AboutMedia | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="cms-media">
      <h3>Image</h3>
      {value && (
        <>
          <img
            src={assetUrl(value.mediaId)}
            alt="Selected image preview"
            style={{ maxWidth: 240 }}
          />
          <Text
            label="Image alt text"
            value={value.alt}
            max={300}
            change={(alt) => change({ ...value, alt })}
          />
          <label>
            <input
              type="checkbox"
              checked={value.decorative}
              onChange={(e) =>
                change({ ...value, decorative: e.target.checked })
              }
            />{" "}
            Decorative image
          </label>
          {(
            [
              "focalX",
              "focalY",
              "tabletFocalX",
              "tabletFocalY",
              "mobileFocalX",
              "mobileFocalY",
            ] as const
          ).map((key, index) => (
            <label className="field-label" key={key}>
              {
                [
                  "Desktop horizontal",
                  "Desktop vertical",
                  "Tablet horizontal",
                  "Tablet vertical",
                  "Mobile horizontal",
                  "Mobile vertical",
                ][index]
              }{" "}
              focal point: {value[key]}%
              <input
                type="range"
                min={0}
                max={100}
                value={value[key]}
                onChange={(e) =>
                  change({ ...value, [key]: Number(e.target.value) })
                }
              />
            </label>
          ))}
          <button type="button" onClick={() => change(undefined)}>
            Remove image
          </button>
        </>
      )}
      <button type="button" onClick={() => setOpen(true)}>
        Choose image
      </button>
      {open && (
        <MediaPicker
          selected={value?.mediaId ?? ""}
          close={() => setOpen(false)}
          choose={(mediaId, defaults) => {
            change({
              mediaId,
              alt: defaults?.alt ?? "",
              decorative: defaults?.decorative ?? true,
              focalX: defaults?.focalX ?? 50,
              focalY: defaults?.focalY ?? 50,
              tabletFocalX: defaults?.focalX ?? 50,
              tabletFocalY: defaults?.focalY ?? 50,
              mobileFocalX: defaults?.focalX ?? 50,
              mobileFocalY: defaults?.focalY ?? 50,
              ...defaults,
            });
            setOpen(false);
          }}
        />
      )}
    </section>
  );
}
