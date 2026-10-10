"use client";
import { useState } from "react";
import type { SeoText } from "@/schemas/seo-text";
import { MediaPicker } from "./media-picker";
import { assetUrl } from "@/content/homepage-assets";

export function SeoEditor({
  value,
  path,
  onChange,
}: {
  value: SeoText;
  path: string;
  onChange: (seo: SeoText) => void;
}) {
  const [picker, setPicker] = useState(false),
    [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const update = (patch: Partial<SeoText>) => onChange({ ...value, ...patch });
  const title = value.title.trim() || "Page title";
  const description =
    value.description.trim() || "Your search description will appear here.";
  const canonical = "https://codeyea.com" + (value.canonicalPath || path);
  return (
    <section className="seo-editor" aria-label="Search appearance">
      <h3>Search and sharing details</h3>
      <label className="field-label">
        SEO title{" "}
        <input
          maxLength={120}
          value={value.title}
          onChange={(e) => update({ title: e.target.value })}
        />
        <small>{value.title.length}/120 characters</small>
      </label>
      <label className="field-label">
        Meta description{" "}
        <textarea
          maxLength={320}
          rows={4}
          value={value.description}
          onChange={(e) => update({ description: e.target.value })}
        />
        <small>{value.description.length}/320 characters</small>
      </label>
      <label className="field-label">
        Focus phrase{" "}
        <input
          maxLength={120}
          value={value.focusPhrase ?? ""}
          onChange={(e) => update({ focusPhrase: e.target.value })}
          placeholder="Primary phrase for this page"
        />
        <small>Editorial guidance only; it does not guarantee a ranking.</small>
      </label>
      <label className="field-label">
        Canonical path{" "}
        <input
          maxLength={240}
          value={value.canonicalPath ?? ""}
          onChange={(e) => update({ canonicalPath: e.target.value })}
          placeholder={path}
        />
        <small>Same-site path only. Leave empty to use {path}.</small>
      </label>
      <fieldset>
        <legend>Search engine access</legend>
        <label>
          <input
            type="checkbox"
            checked={value.index !== false}
            onChange={(e) => update({ index: e.target.checked })}
          />{" "}
          Allow search engines to index this page
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.follow !== false}
            onChange={(e) => update({ follow: e.target.checked })}
          />{" "}
          Allow search engines to follow links
        </label>
      </fieldset>
      <label className="field-label">
        Social title{" "}
        <input
          maxLength={120}
          value={value.socialTitle ?? ""}
          onChange={(e) => update({ socialTitle: e.target.value })}
          placeholder="Use search title"
        />
      </label>
      <label className="field-label">
        Social description{" "}
        <textarea
          maxLength={320}
          rows={3}
          value={value.socialDescription ?? ""}
          onChange={(e) => update({ socialDescription: e.target.value })}
          placeholder="Use search description"
        />
      </label>
      <div className="cms-media">
        <span className="field-label">Social sharing image</span>
        {value.socialImage && (
          <>
            <img
              src={assetUrl(value.socialImage.mediaId)}
              alt="Selected social preview image"
              style={{ maxWidth: 240 }}
            />
            <label className="field-label">
              Image alt text
              <input
                maxLength={300}
                value={value.socialImage.alt}
                onChange={(e) =>
                  update({
                    socialImage: {
                      ...value.socialImage!,
                      alt: e.target.value,
                      decorative: false,
                    },
                  })
                }
              />
            </label>
          </>
        )}
        <div className="cms-actions">
          <button type="button" onClick={() => setPicker(true)}>
            {value.socialImage ? "Change image" : "Choose image"}
          </button>
          {value.socialImage && (
            <button
              type="button"
              onClick={() => update({ socialImage: undefined })}
            >
              Remove image
            </button>
          )}
        </div>
      </div>
      <section
        className="seo-result"
        aria-label="Estimated Google search result"
      >
        <div className="seo-result-toolbar">
          <strong>Google result preview</strong>
          <span>Estimate — Google may rewrite it</span>
          <div className="cms-actions">
            {(["desktop", "mobile"] as const).map((size) => (
              <button
                type="button"
                key={size}
                aria-pressed={device === size}
                onClick={() => setDevice(size)}
              >
                {size === "desktop" ? "Desktop" : "Mobile"}
              </button>
            ))}
          </div>
        </div>
        <article className={"seo-result-card " + device}>
          <div title={canonical}>
            CODEYEA <span> › {value.canonicalPath || path}</span>
          </div>
          <a>{title}</a>
          <p>{description}</p>
        </article>
        <div className="seo-result-card social">
          <strong>Social sharing preview</strong>
          {value.socialImage && (
            <img src={assetUrl(value.socialImage.mediaId)} alt="" />
          )}
          <b>{value.socialTitle?.trim() || title}</b>
          <p>{value.socialDescription?.trim() || description}</p>
          <small>codeyea.com</small>
        </div>
      </section>
      {picker && (
        <MediaPicker
          selected={value.socialImage?.mediaId ?? ""}
          close={() => setPicker(false)}
          choose={(mediaId, defaults) => {
            update({
              socialImage: {
                mediaId,
                alt: defaults?.alt ?? "",
                decorative: !defaults?.alt?.trim(),
              },
            });
            setPicker(false);
          }}
        />
      )}
    </section>
  );
}
