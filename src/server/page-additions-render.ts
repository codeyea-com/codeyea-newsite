import {
  resolvePageAdditions,
  type PageAdditions,
} from "@/schemas/page-additions";
import { assetUrl } from "@/content/homepage-assets";
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function renderPageAdditions(
  html: string,
  slug: string,
  value: PageAdditions | undefined,
  preview: boolean,
  locale = "en",
) {
  const additions = resolvePageAdditions(slug, value);
  const destination = (href: string) => {
    if (!preview) return href;
    const url = new URL(href, "https://local.invalid");
    url.pathname = url.pathname.replace(
      /^\/(?:ar\/)?([^/]+)\/?$/,
      "/preview/pages/$1",
    );
    if (locale === "ar") url.searchParams.set("locale", "ar");
    return url.pathname + url.search + url.hash;
  };
  let markup = "";
  if (additions.support?.enabled) {
    const s = additions.support,
      src = s.mediaId ? assetUrl(s.mediaId) : "/homepage/support.webp";
    markup += `<section class="cy-support-promo v-wrap" id="hosting-technical-support"><figure><img src="${escape(src)}" alt="${escape(s.alt)}" loading="lazy" width="1200" height="800"></figure><div><span class="v-label">${escape(s.label)}</span><h2>${escape(s.heading)}</h2><p>${escape(s.body)}</p><a class="hp-button" href="${escape(destination(s.href))}">${escape(s.actionLabel)} <span aria-hidden="true">↗</span></a></div></section>`;
  }
  if (additions.search?.enabled) {
    const s = additions.search;
    markup += `<section class="cy-search-services ds-wrap" id="search-answer-ai"><header><span class="ds-label">${escape(s.label)}</span><h2>${escape(s.heading)}</h2><p>${escape(s.body)}</p></header><div class="cy-search-service-rows">${s.items.map((item, i) => `<article><span aria-hidden="true">0${i + 1}</span><h3>${escape(item.title)}</h3><p>${escape(item.body)}</p></article>`).join("")}</div><a class="b-btn" href="${escape(destination(s.href))}">${escape(s.actionLabel)} <span aria-hidden="true">↗</span></a></section>`;
  }
  if (markup)
    html = html.replace(
      /(<section\b[^>]*\bclass="[^"]*\b(?:v-faq|ai-faq)\b)/,
      markup + "$1",
    );
  if (additions.discount?.enabled) {
    const d = additions.discount;
    html = html.replace(/<span class="hp-saving-note">[\s\S]*?<\/span>/, "");
    html = html.replace(
      '<div class="hp-billing-wrap">',
      `<div class="hp-billing-wrap"><span class="hp-saving-note">${locale === "ar" ? "وفر" : "Save"} ${d.percent}%<svg viewBox="0 0 60 40" width="60" height="40" fill="none" aria-hidden="true"><path d="M50 3Q45 28 8 30m0 0 10-8M8 30l13 3" stroke="currentColor" stroke-width="1.4"></path></svg><small>${escape(d.label)}</small></span>`,
    );
  }
  if (additions.discount) {
    const discount = additions.discount;
    html = html.replace(/"slider":(\{[^}]+\})/g, (_all, raw) => {
      const spec = JSON.parse(raw);
      spec.annualDiscount = discount.enabled ? discount.percent / 100 : 0;
      return '"slider":' + JSON.stringify(spec);
    });
    if (slug === "email-hosting")
      html = html.replace(
        "Annual examples are monthly × 12;",
        "Annual examples include " + discount.percent + "% savings;",
      );
  }
  if (slug === "technical-support")
    html = html.replace(
      '<section class="b-contact">',
      '<section class="b-contact cy-support-cta">',
    );
  return html;
}
