"use client";
import {
  resolvePageAdditions,
  type PageAdditions,
} from "@/schemas/page-additions";
import { TemplateImageEditor } from "./template-image-editor";
import { HostingServerFeaturesEditor } from "./hosting-server-features-editor";
export function PageAdditionsEditor({
  slug,
  locale = "en",
  value,
  onChange,
}: {
  slug: string;
  locale?: string;
  value?: PageAdditions;
  onChange: (value: PageAdditions) => void;
}) {
  const data = resolvePageAdditions(slug, value, locale);
  const rotating =
    /^(ai-automation|technical-support|web-mobile-apps|digital-marketing|seo-geo)$/.test(
      slug,
    );
  if (!Object.keys(data).length && !rotating) return null;
  return (
    <section className="cms-panel">
      <h2>Additional page sections</h2>
      {data.serverFeatures && <HostingServerFeaturesEditor value={data.serverFeatures} onChange={serverFeatures => onChange({ ...data, serverFeatures })} />}
      {data.galleryCaptions && (
        <details>
          <summary>
            Image popup explanations · {data.galleryCaptions.length}
          </summary>
          {data.galleryCaptions.map((item, index) => (
            <fieldset key={index}>
              <legend>Image {index + 1}</legend>
              {(["title", "body"] as const).map((field) => (
                <label className="site-field" key={field}>
                  {field}
                  <textarea
                    dir="auto"
                    maxLength={field === "title" ? 200 : 3000}
                    value={item[field]}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        galleryCaptions: data.galleryCaptions!.map((row, i) =>
                          i === index
                            ? { ...row, [field]: e.target.value }
                            : row,
                        ),
                      })
                    }
                  />
                </label>
              ))}
            </fieldset>
          ))}
        </details>
      )}
      {data.faq && (
        <details>
          <summary>Brand design FAQs</summary>
          <label>
            <input
              type="checkbox"
              checked={data.faq.enabled}
              onChange={(e) =>
                onChange({
                  ...data,
                  faq: { ...data.faq!, enabled: e.target.checked },
                })
              }
            />{" "}
            Visible
          </label>
          <label className="site-field">
            Heading
            <textarea
              dir="auto"
              value={data.faq.heading}
              maxLength={300}
              onChange={(e) =>
                onChange({
                  ...data,
                  faq: { ...data.faq!, heading: e.target.value },
                })
              }
            />
          </label>
          {data.faq.items.map((item, index) => (
            <fieldset key={index}>
              <legend>Question {index + 1}</legend>
              {(["title", "body"] as const).map((field) => (
                <label className="site-field" key={field}>
                  {field}
                  <textarea
                    dir="auto"
                    maxLength={field === "title" ? 200 : 3000}
                    value={item[field]}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        faq: {
                          ...data.faq!,
                          items: data.faq!.items.map((row, i) =>
                            i === index
                              ? { ...row, [field]: e.target.value }
                              : row,
                          ),
                        },
                      })
                    }
                  />
                </label>
              ))}
            </fieldset>
          ))}
        </details>
      )}
      {rotating && (
        <label className="site-field">
          Rotating heading words · one per line
          <textarea
            value={(data.introWords ?? []).join("\n")}
            onChange={(e) =>
              onChange({
                ...data,
                introWords: e.target.value.split("\n"),
              })
            }
            onBlur={(e) => {
              const words = e.target.value
                .split("\n")
                .map((word) => word.trim())
                .filter(Boolean);
              onChange({
                ...data,
                introWords: words.length ? words : undefined,
              });
            }}
          />
        </label>
      )}
      {(["support", "search"] as const).map((key) => {
        const s = data[key];
        if (!s) return null;
        const change = (patch: Partial<typeof s>) =>
          onChange({ ...data, [key]: { ...s, ...patch } });
        return (
          <details key={key}>
            <summary>
              {key === "support"
                ? "Hosting technical support promotion"
                : "SEO, AEO and GEO services"}
            </summary>
            <label>
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={(e) => change({ enabled: e.target.checked })}
              />
              Visible
            </label>
            {(["label", "heading", "body", "actionLabel", "href"] as const).map(
              (field) => (
                <label className="site-field" key={field}>
                  {field}
                  <textarea
                    value={s[field]}
                    onChange={(e) => change({ [field]: e.target.value })}
                  />
                </label>
              ),
            )}
            {key === "support" && (
              <TemplateImageEditor
                value={[
                  {
                    key: "addition-support",
                    mediaId: s.mediaId,
                    alt: s.alt,
                    decorative: false,
                  },
                ]}
                onChange={(images) =>
                  change({ mediaId: images[0].mediaId, alt: images[0].alt })
                }
              />
            )}{" "}
            {s.items.map((item, index) => (
              <fieldset key={index}>
                <legend>Service {index + 1}</legend>
                {(["title", "body"] as const).map((field) => (
                  <label className="site-field" key={field}>
                    {field}
                    <textarea
                      value={item[field]}
                      onChange={(e) =>
                        change({
                          items: s.items.map((row, i) =>
                            i === index
                              ? { ...row, [field]: e.target.value }
                              : row,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
              </fieldset>
            ))}
          </details>
        );
      })}
      {data.discount && (
        <fieldset>
          <legend>Annual billing saving</legend>
          <label>
            <input
              type="checkbox"
              checked={data.discount.enabled}
              onChange={(e) =>
                onChange({
                  ...data,
                  discount: { ...data.discount!, enabled: e.target.checked },
                })
              }
            />
            Visible
          </label>
          <label className="site-field">
            Discount percent
            <input
              type="number"
              min={0}
              max={100}
              value={data.discount.percent}
              onChange={(e) =>
                onChange({
                  ...data,
                  discount: {
                    ...data.discount!,
                    percent: Number(e.target.value),
                  },
                })
              }
            />
          </label>
          <label className="site-field">
            Billing label
            <input
              value={data.discount.label}
              onChange={(e) =>
                onChange({
                  ...data,
                  discount: { ...data.discount!, label: e.target.value },
                })
              }
            />
          </label>
        </fieldset>
      )}
    </section>
  );
}
