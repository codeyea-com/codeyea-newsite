"use client";
import { useState } from "react";
import type { TemplateControls } from "@/schemas/template-controls";
import { MediaPicker } from "./media-picker";
import { assetUrl } from "@/content/homepage-assets";
export function TemplateControlsEditor({
  value,
  onChange,
}: {
  value: TemplateControls;
  onChange: (controls: TemplateControls) => void;
}) {
  const [image, setImage] = useState<number | null>(null),
    [query, setQuery] = useState("");
  return (
    <section
      aria-label="All template elements"
      className="template-controls-editor"
    >
      <h2>Page sections, buttons and hero artwork</h2>
      <label className="field-label">
        Find an element
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Section, button, image or artwork text"
        />
      </label>
      <details className="site-report">
        <summary>Section visibility · {value.sections.length}</summary>
        {value.sections
          .filter((entry) =>
            entry.label.toLowerCase().includes(query.toLowerCase()),
          )
          .map((entry) => (
            <label key={entry.key} className="template-control-check">
              <input
                type="checkbox"
                checked={entry.enabled}
                onChange={(e) =>
                  onChange({
                    ...value,
                    sections: value.sections.map((item) =>
                      item.key === entry.key
                        ? { ...item, enabled: e.target.checked }
                        : item,
                    ),
                  })
                }
              />
              {entry.label}
            </label>
          ))}
      </details>
      <details className="site-report">
        <summary>Buttons and links · {value.links.length}</summary>
        {value.links
          .filter((entry) =>
            entry.label.toLowerCase().includes(query.toLowerCase()),
          )
          .map((entry) => (
            <label key={entry.key} className="field-label">
              {entry.label}
              <input
                value={entry.href}
                onChange={(e) =>
                  onChange({
                    ...value,
                    links: value.links.map((item) =>
                      item.key === entry.key
                        ? { ...item, href: e.target.value }
                        : item,
                    ),
                  })
                }
              />
            </label>
          ))}
      </details>
      <details className="site-report">
        <summary>
          Hero artwork and background images · {value.assets.length}
        </summary>
        <div className="template-image-grid">
          {value.assets
            .map((entry, index) => ({ entry, index }))
            .filter(({ entry }) =>
              entry.label.toLowerCase().includes(query.toLowerCase()),
            )
            .map(({ entry, index }) => (
              <article key={entry.key}>
                <img
                  src={entry.mediaId ? assetUrl(entry.mediaId) : entry.source}
                  alt=""
                  loading="lazy"
                />
                <strong>{entry.label}</strong>
                <label className="field-label">Image alt text<input maxLength={300} value={entry.alt??""} onChange={e=>onChange({...value,assets:value.assets.map(item=>item.key===entry.key?{...item,alt:e.target.value,decorative:false}:item)})}/></label>
                <label><input type="checkbox" checked={entry.decorative??true} onChange={e=>onChange({...value,assets:value.assets.map(item=>item.key===entry.key?{...item,decorative:e.target.checked}:item)})}/> Decorative image</label>
                <button type="button" onClick={() => setImage(index)}>
                  Replace image
                </button>
                {entry.mediaId && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...value,
                        assets: value.assets.map((item) =>
                          item.key === entry.key
                            ? { ...item, mediaId: "" }
                            : item,
                        ),
                      })
                    }
                  >
                    Restore original image
                  </button>
                )}
              </article>
            ))}
        </div>
      </details>
      <details className="site-report">
        <summary>Artwork text · {value.artworkText.length}</summary>
        {value.artworkText
          .filter((entry) =>
            entry.label.toLowerCase().includes(query.toLowerCase()),
          )
          .map((entry) => (
            <label key={entry.key} className="field-label">
              {entry.label}
              <textarea
                rows={2}
                value={entry.value}
                onChange={(e) =>
                  onChange({
                    ...value,
                    artworkText: value.artworkText.map((item) =>
                      item.key === entry.key
                        ? { ...item, value: e.target.value }
                        : item,
                    ),
                  })
                }
              />
            </label>
          ))}
      </details>
      {image !== null && (
        <MediaPicker
          selected={value.assets[image].mediaId}
          close={() => setImage(null)}
          choose={(mediaId,defaults) => {
            onChange({
              ...value,
              assets: value.assets.map((item, index) =>
                index === image ? { ...item, mediaId,alt:defaults?.alt??"",decorative:!defaults?.alt?.trim() } : item,
              ),
            });
            setImage(null);
          }}
        />
      )}
    </section>
  );
}
