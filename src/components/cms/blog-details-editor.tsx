"use client";
import { useState } from "react";
import type { BlogMetadata } from "@/schemas/blog";
import { assetUrl } from "@/content/homepage-assets";
import { MediaPicker } from "./media-picker";
export function BlogDetailsEditor({
  value,
  tags,
  onChange,
  onTagsChange,
}: {
  value: BlogMetadata;
  tags: string[];
  onChange: (value: BlogMetadata) => void;
  onTagsChange: (tags: string[]) => void;
}) {
  const [picker, setPicker] = useState(false);
  return (
    <section aria-label="Blog article details">
      <h2>Blog article details</h2>
      <label className="field-label">
        Author
        <input
          maxLength={120}
          value={value.author}
          onChange={(e) => onChange({ ...value, author: e.target.value })}
        />
      </label>
      <label className="field-label">
        Excerpt
        <textarea
          maxLength={500}
          rows={3}
          value={value.excerpt}
          onChange={(e) => onChange({ ...value, excerpt: e.target.value })}
        />
      </label>
      <label className="field-label">
        Categories · comma separated
        <input
          value={value.categories.join(", ")}
          onChange={(e) =>
            onChange({
              ...value,
              categories: [
                ...new Set(
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                ),
              ],
            })
          }
        />
      </label>
      <label className="field-label">
        Tags · comma separated
        <input
          value={tags.join(", ")}
          onChange={(e) =>
            onTagsChange([
              ...new Set(
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              ),
            ])
          }
        />
      </label>
      <div className="cms-media">
        <strong>Featured image</strong>
        {value.coverImage && (
          <>
            <img
              src={assetUrl(value.coverImage.mediaId)}
              alt={value.coverImage.alt}
              style={{ maxWidth: 300 }}
            />
            <label className="field-label">
              Image alt text
              <input
                maxLength={300}
                value={value.coverImage.alt}
                onChange={(e) =>
                  onChange({
                    ...value,
                    coverImage: {
                      ...value.coverImage!,
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
            {value.coverImage
              ? "Replace featured image"
              : "Choose featured image"}
          </button>
          {value.coverImage && (
            <button
              type="button"
              onClick={() => onChange({ ...value, coverImage: undefined })}
            >
              Remove image
            </button>
          )}
        </div>
      </div>
      <p className="small">
        Article drafts, media, categories, tags and SEO are ready for the future
        Blog archive. Public blog design and article publication remain
        separate.
      </p>
      {picker && (
        <MediaPicker
          selected={value.coverImage?.mediaId ?? ""}
          close={() => setPicker(false)}
          choose={(mediaId, defaults) => {
            onChange({
              ...value,
              coverImage: {
                mediaId,
                alt: defaults?.alt ?? "",
                decorative: defaults?.decorative ?? false,
              },
            });
            setPicker(false);
          }}
        />
      )}
    </section>
  );
}
