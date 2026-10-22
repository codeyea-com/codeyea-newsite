import {
  resolvePageAdditions,
  type PageAdditions,
} from "@/schemas/page-additions";
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/** Add editable copy without changing the approved template's field/hash map. */
export function renderReviewAdditions(
  html: string,
  slug: string,
  locale: string,
  value?: PageAdditions,
) {
  const additions = resolvePageAdditions(slug, value, locale);
  if (slug === "website-design")
    html = html.replace(
      /(<div class="w-service-name">)([\s\S]*?)(<\/div>)/,
      (_all, start, body, end) =>
        start + body.replace(/<br\s*\/?\s*>/gi, " ") + end,
    );
  if (additions.galleryCaptions) {
    html = html.replace(
      /<section\b[^>]*class="[^"]*\bb-work\b[^"]*"[^>]*>[\s\S]*?<\/section>/g,
      (section) => {
        let index = 0;
        return section.replace(/<figure\b[^>]*>/g, (tag) => {
          const caption = additions.galleryCaptions?.[index++];
          return caption
            ? tag.replace(
                />$/,
                ` data-photo-title="${escape(caption.title)}" data-photo-description="${escape(caption.body)}">`,
              )
            : tag;
        });
      },
    );
  }
  if (slug === "brand-design" && additions.faq?.enabled) {
    const faq = additions.faq;
    const markup = `<section id="brand-design-faq" class="e-faq b-wrap b-section cy-brand-faq"><div><span class="b-eyebrow">${escape(faq.label)}</span><h2>${escape(faq.heading)}</h2></div><div>${faq.items.map((item) => `<details><summary class="cy-faq-question">${escape(item.title)}</summary><p>${escape(item.body)}</p></details>`).join("")}</div></section>`;
    html = html.replace(/(?=<section\b[^>]*class="[^"]*\bb-contact\b)/, markup);
  }
  return html;
}
