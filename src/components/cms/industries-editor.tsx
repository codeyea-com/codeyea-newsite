"use client";
import { useState, type FormEvent } from "react";
import {
  industriesPageSchema,
  type IndustryItem,
} from "@/schemas/industries-page";
import type { AboutMedia } from "@/schemas/about";
import type { Page } from "./types";
import { MediaPicker } from "./media-picker";
import { assetUrl } from "@/content/homepage-assets";
import { SeoEditor } from "./seo-editor";
type Props = {
  draft: Page;
  dirty: boolean;
  busy: boolean;
  canEdit: boolean;
  onChange: (page: Page) => void;
  onSave: (event: FormEvent) => void;
};
function Text({
  label,
  value,
  onChange,
  long = false,
  max = label === "Search title"
    ? 120
    : label === "Search description"
      ? 320
      : 2000,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  long?: boolean;
  max?: number;
}) {
  return (
    <label className="field-label">
      {label}
      {long ? (
        <textarea
          aria-label={label}
          rows={5}
          maxLength={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          aria-label={label}
          maxLength={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
function ImageField({
  value,
  onChange,
}: {
  value: AboutMedia;
  onChange: (v: AboutMedia) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="cms-media">
      <img
        src={assetUrl(value.mediaId)}
        alt="Selected image"
        style={{ maxWidth: 240 }}
      />
      <button type="button" onClick={() => setOpen(true)}>
        Choose image
      </button>
      <Text
        label="Image alt text"
        value={value.alt}
        onChange={(alt) => onChange({ ...value, alt })}
      />
      <label>
        <input
          type="checkbox"
          checked={value.decorative}
          onChange={(e) => onChange({ ...value, decorative: e.target.checked })}
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
      ).map((key, n) => (
        <label className="field-label" key={key}>
          {
            [
              "Desktop horizontal",
              "Desktop vertical",
              "Tablet horizontal",
              "Tablet vertical",
              "Mobile horizontal",
              "Mobile vertical",
            ][n]
          }{" "}
          focal position
          <input
            type="range"
            min={0}
            max={100}
            value={value[key]}
            onChange={(e) =>
              onChange({ ...value, [key]: Number(e.target.value) })
            }
          />
        </label>
      ))}
      {open && (
        <MediaPicker
          selected={value.mediaId}
          close={() => setOpen(false)}
          choose={(mediaId, defaults) => {
            onChange({ ...value, ...defaults, mediaId });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
export function IndustriesEditor({
  draft,
  dirty,
  busy,
  canEdit,
  onChange,
  onSave,
}: Props) {
  const content = draft.industriesPage!,
    [selected, setSelected] = useState("hero"),
    [error, setError] = useState(""),
    [preview, setPreview] = useState(false),
    [width, setWidth] = useState(1440);
  const update = (next: typeof content) => {
    setPreview(false);
    onChange({ ...draft, industriesPage: next });
  };
  const item = content.items.find((i) => i.id === selected);
  const change = (next: IndustryItem) =>
    update({
      ...content,
      items: content.items.map((i) => (i.id === next.id ? next : i)),
    });
  const move = (index: number, offset: number) => {
    const items = [...content.items];
    const [entry] = items.splice(index, 1);
    items.splice(index + offset, 0, entry);
    update({
      ...content,
      items: items.map((i, position) => ({ ...i, position })),
    });
  };
  function submit(e: FormEvent) {
    const parsed = industriesPageSchema.safeParse(content);
    if (!parsed.success) {
      e.preventDefault();
      setError(
        parsed.error.issues
          .map((i) => i.path.join(".") + ": " + i.message)
          .join(" · "),
      );
      return;
    }
    setError("");
    onSave(e);
  }
  return (
    <form onSubmit={submit}>
      <div className="editor-toolbar cms-sticky">
        <strong>
          {dirty ? "Unsaved changes" : "Private saved Industries draft"} · v
          {draft.version}
        </strong>
        <div className="cms-actions">
          <button className="button" disabled={!dirty || busy || !canEdit}>
            Save draft
          </button>
          <button
            className="button secondary"
            type="button"
            disabled={dirty || busy}
            onClick={() => setPreview(!preview)}
          >
            Preview
          </button>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      {preview && (
        <section className="cms-preview">
          <div className="cms-actions">
            {[1440, 768, 390, 320].map((w) => (
              <button type="button" key={w} onClick={() => setWidth(w)}>
                {w}px
              </button>
            ))}
            <a
              href={
                content.localeId === "ar"
                  ? "/preview/ar/industries"
                  : "/preview/industries"
              }
              target="_blank"
              rel="noopener"
            >
              Open saved private preview
            </a>
          </div>
          <div className="cms-preview-scroll">
            <iframe
              title="Complete Industries private preview"
              src={
                content.localeId === "ar"
                  ? "/preview/ar/industries"
                  : "/preview/industries"
              }
              style={{ width, height: 800 }}
            />
          </div>
        </section>
      )}
      <div className="editor-grid">
        <nav className="section-list" aria-label="Industries sections">
          <h2>Industries sections</h2>
          <button
            type="button"
            className={
              "section-item " + (selected === "seo" ? "selected" : " ")
            }
            onClick={() => setSelected("seo")}
          >
            Search & sharing
          </button>
          <button
            type="button"
            className={
              "section-item " + (selected === "hero" ? "selected" : " ")
            }
            onClick={() => setSelected("hero")}
          >
            Hero
          </button>
          <button
            type="button"
            className="section-item"
            onClick={() => setSelected("introduction")}
          >
            Introduction
          </button>
          {content.items.map((i, n) => (
            <button
              type="button"
              className={
                "section-item " + (selected === i.id ? "selected" : "")
              }
              key={i.id}
              onClick={() => setSelected(i.id)}
            >
              {n + 1}. {i.title}
              {!i.enabled ? " (hidden)" : ""}
            </button>
          ))}
          <button
            type="button"
            className="section-item"
            onClick={() => setSelected("cta")}
          >
            Final call to action
          </button>
          <button
            type="button"
            disabled={!canEdit || busy || content.items.length >= 40}
            onClick={() => {
              const source = content.items[0];
              if (!source) return;
              const next = {
                ...structuredClone(source),
                id: crypto.randomUUID(),
                position: content.items.length,
                title: "New industry",
                body: "Add industry summary",
                ctaLabel: "Explore New industry",
                destination: "",
                enabled: false,
              };
              update({ ...content, items: [...content.items, next] });
              setSelected(next.id);
            }}
          >
            Add industry
          </button>
        </nav>
        <section className="editor-fields">
          <p>
            Content only. The four approved layouts repeat across enabled
            industries in order. Shared header, footer and Hero design are
            protected.
          </p>
          <fieldset disabled={!canEdit || busy} className="cms-fields">
            {selected === "seo" ? (
              <>
                <h2>Search title and description</h2>
                <Text
                  label="Search title"
                  value={content.seo?.title ?? "Industries We Serve | CODEYEA"}
                  onChange={(title) =>
                    update({
                      ...content,
                      seo: {
                        title,
                        description:
                          content.seo?.description ??
                          "Digital solutions shaped around your industry, customers and workflows.",
                      },
                    })
                  }
                />
                <Text
                  label="Search description"
                  value={
                    content.seo?.description ??
                    "Digital solutions shaped around your industry, customers and workflows."
                  }
                  long
                  onChange={(description) =>
                    update({
                      ...content,
                      seo: {
                        title:
                          content.seo?.title ?? "Industries We Serve | CODEYEA",
                        description,
                      },
                    })
                  }
                />
              </>
            ) : selected === "hero" ? (
              <>
                <h2>Hero</h2>
                <p>
                  Brand line: CODEYEA (fixed). Temporary image, editable below.
                </p>
                <Text
                  label="Page H1"
                  value={content.hero.title}
                  onChange={(title) =>
                    update({ ...content, hero: { ...content.hero, title } })
                  }
                />
                <ImageField
                  value={content.hero.media}
                  onChange={(media) =>
                    update({ ...content, hero: { ...content.hero, media } })
                  }
                />
              </>
            ) : selected === "introduction" ? (
              <>
                <h2>Introduction</h2>
                <label>
                  <input
                    type="checkbox"
                    checked={content.introduction.enabled}
                    onChange={(e) =>
                      update({
                        ...content,
                        introduction: {
                          ...content.introduction,
                          enabled: e.target.checked,
                        },
                      })
                    }
                  />{" "}
                  Enabled
                </label>
                {(["label", "heading"] as const).map((key) => (
                  <Text
                    key={key}
                    label={"Introduction " + key}
                    value={content.introduction[key]}
                    onChange={(v) =>
                      update({
                        ...content,
                        introduction: { ...content.introduction, [key]: v },
                      })
                    }
                  />
                ))}
                {content.introduction.paragraphs.map((p, n) => (
                  <Text
                    key={p.id}
                    label={"Introduction paragraph " + (n + 1)}
                    value={p.body}
                    long
                    onChange={(body) =>
                      update({
                        ...content,
                        introduction: {
                          ...content.introduction,
                          paragraphs: content.introduction.paragraphs.map(
                            (v) => (v.id === p.id ? { ...v, body } : v),
                          ),
                        },
                      })
                    }
                  />
                ))}
              </>
            ) : selected === "cta" ? (
              <>
                <h2>Final call to action</h2>
                <label>
                  <input
                    type="checkbox"
                    checked={content.cta.enabled}
                    onChange={(e) =>
                      update({
                        ...content,
                        cta: { ...content.cta, enabled: e.target.checked },
                      })
                    }
                  />{" "}
                  Enabled
                </label>
                {(["label", "heading", "body", "actionLabel"] as const).map(
                  (key) => (
                    <Text
                      key={key}
                      label={key}
                      value={content.cta[key]}
                      long={key === "body"}
                      onChange={(v) =>
                        update({
                          ...content,
                          cta: { ...content.cta, [key]: v },
                        })
                      }
                    />
                  ),
                )}
                <p>Destination uses the shared configured contact action.</p>
              </>
            ) : (
              item && (
                <>
                  <h2>{item.title}</h2>
                  <p>Stable ID: {item.id}</p>
                  <div className="cms-actions">
                    <button
                      type="button"
                      disabled={item.position === 0}
                      onClick={() =>
                        move(
                          content.items.findIndex((i) => i.id === item.id),
                          -1,
                        )
                      }
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      disabled={item.position === content.items.length - 1}
                      onClick={() =>
                        move(
                          content.items.findIndex((i) => i.id === item.id),
                          1,
                        )
                      }
                    >
                      Move down
                    </button>
                    <label>
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) =>
                          change({ ...item, enabled: e.target.checked })
                        }
                      />{" "}
                      Enabled
                    </label>
                  </div>
                  {(
                    [
                      "label",
                      "title",
                      "heading",
                      "body",
                      "ctaLabel",
                      "destination",
                    ] as const
                  ).map((key) => (
                    <Text
                      key={key}
                      label={key}
                      value={item[key]}
                      long={key === "body"}
                      onChange={(v) => change({ ...item, [key]: v })}
                    />
                  ))}
                  <p>
                    Heading and action share this destination. Leave blank until
                    known. A configured path stays inactive until its real
                    detail route is implemented.
                  </p>
                  <h3>Highlights</h3>
                  {item.highlights.map((h, n) => (
                    <details key={h.id}>
                      <summary>{h.title}</summary>
                      <Text
                        label="Highlight title"
                        value={h.title}
                        onChange={(title) =>
                          change({
                            ...item,
                            highlights: item.highlights.map((v, k) =>
                              k === n ? { ...v, title } : v,
                            ),
                          })
                        }
                      />
                      <Text
                        label="Highlight detail"
                        value={h.body}
                        long
                        onChange={(body) =>
                          change({
                            ...item,
                            highlights: item.highlights.map((v, k) =>
                              k === n ? { ...v, body } : v,
                            ),
                          })
                        }
                      />
                      <button
                        type="button"
                        disabled={item.highlights.length <= 3}
                        onClick={() =>
                          change({
                            ...item,
                            highlights: item.highlights.filter(
                              (_, k) => k !== n,
                            ),
                          })
                        }
                      >
                        Remove highlight
                      </button>
                    </details>
                  ))}
                  <button
                    type="button"
                    disabled={item.highlights.length >= 6}
                    onClick={() =>
                      change({
                        ...item,
                        highlights: [
                          ...item.highlights,
                          {
                            id: crypto.randomUUID(),
                            title: "New highlight",
                            body: "",
                          },
                        ],
                      })
                    }
                  >
                    Add highlight
                  </button>
                  <p>
                    The expandable layout shows the first three highlights; the
                    capability layout shows all highlights. Image-led layouts
                    retain them in the editor.
                  </p>
                  <h3>Section image</h3>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.temporaryMedia}
                      onChange={(e) =>
                        change({ ...item, temporaryMedia: e.target.checked })
                      }
                    />{" "}
                    Temporary media awaiting owner replacement
                  </label>
                  <ImageField
                    value={item.media}
                    onChange={(media) => change({ ...item, media })}
                  />
                  <p>
                    One image, one alt text and one focal-position contract. The
                    divider is decorative and developer-controlled.
                  </p>
                </>
              )
            )}
          </fieldset>
          {selected === "seo" && (
            <fieldset className="cms-fields" disabled={!canEdit || busy}>
              <SeoEditor
                value={
                  content.seo ?? {
                    title: "Industries We Serve | CODEYEA",
                    description:
                      "Digital solutions shaped around your industry, customers and workflows.",
                  }
                }
                path={
                  content.localeId === "ar" ? "/ar/industries/" : "/industries/"
                }
                onChange={(seo) => update({ ...content, seo })}
              />
            </fieldset>
          )}
        </section>
      </div>
    </form>
  );
}
