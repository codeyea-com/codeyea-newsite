import { hostingServerFeatureArtwork, hostingServerFeatures } from "../content/hosting-server-features";
import type { HostingServerFeatures } from "../schemas/hosting-server-features";

const pages = new Set([
  "website-hosting",
  "wordpress-hosting",
  "cloud-hosting",
  "email-hosting",
]);
const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[c]!);

/** Reuse the preserved Customer stories composition as hosting features before the FAQ. */
export function renderHostingServerFeatures(locale: string, value?: HostingServerFeatures) {
  const ar = locale === "ar";
  if (value?.enabled === false) return "";
  const copy = { ...hostingServerFeatures[ar ? "ar" : "en"], ...value };
  const arrow = (previous: boolean) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="${previous !== ar ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"}"/></svg>`;
  const logos = (duplicate: boolean) => `<div class="cy-spec-logo-set"${duplicate ? ' aria-hidden="true"' : ""}>${copy.slides.map((slide) => {
    const artwork = hostingServerFeatureArtwork[slide.id];
    return `<div class="cy-spec-logo-card" data-spec-logo="${slide.id}"${duplicate ? "" : ' tabindex="0"'}><img src="/site/server-features/${artwork.file}?v=20261023-3" alt="${duplicate ? "" : escape(artwork.label || slide.title)}" width="129" height="65" loading="lazy" decoding="async"></div>`;
  }).join("")}</div>`;
  return `<section id="server-specifications" class="cy-server-specs" lang="${ar ? "ar" : "en"}" dir="${ar ? "rtl" : "ltr"}" aria-labelledby="server-specifications-title" aria-roledescription="${ar ? "عارض شرائح" : "carousel"}" data-server-features>
  <div class="cy-spec-wrap">
    <header><div><span class="cy-spec-label">${escape(copy.label)}</span><h2 id="server-specifications-title">${escape(copy.heading)}</h2></div><a class="cy-spec-more" href="#hosting-plans"><span>${escape(copy.cta)}</span><i aria-hidden="true">${ar ? "↖" : "↗"}</i></a></header>
    <div class="cy-spec-rule"><span>${escape(copy.category)}</span><i></i></div>
    <div class="cy-spec-layout"><div>
      <span class="cy-spec-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 3h18v7H3zM3 14h18v7H3zM6 6.5h.1M6 17.5h.1M10 6.5h8M10 17.5h8"/></svg></span>
      <div class="cy-spec-slides" tabindex="0" aria-label="${escape(copy.heading)}">${copy.slides.map((slide, index) => `<article class="cy-spec-slide" data-feature="${slide.id}"${index ? " hidden" : ""} aria-label="${index + 1} / ${copy.slides.length}: ${escape(slide.title)}"><p>${escape(slide.body)}</p><small><strong>${escape(slide.title)}</strong><span>${escape(slide.caption)}</span></small></article>`).join("")}</div>
      <div class="cy-spec-controls"><button type="button" data-spec-dir="-1" aria-label="${copy.previous}">${arrow(true)}</button><button type="button" data-spec-dir="1" aria-label="${copy.next}">${arrow(false)}</button></div>
      <p class="cy-spec-note">${escape(copy.note)}</p>
    </div><div class="cy-spec-meter" aria-hidden="true"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" class="cy-spec-meter-base"/><circle cx="100" cy="100" r="94" pathLength="100" class="cy-spec-meter-progress"/></svg><div dir="ltr"><span class="cy-spec-index">1</span><span> / ${copy.slides.length}</span></div></div></div>
    <span class="cy-spec-status" aria-live="polite" data-status-label="${copy.status}"></span>
    <div class="cy-spec-logos" aria-label="${ar ? "أدوات وتقنيات الاستضافة" : "Hosting tools and technologies"}"><div class="cy-spec-logo-track">${logos(false)}${logos(true)}</div></div>
    <p class="cy-spec-logo-note">${escape(copy.logoNote)}</p>
  </div>
</section>`;
}

export function integrateHostingServerFeatures(html: string, slug: string, locale: string, value?: HostingServerFeatures) {
  if (!pages.has(slug) || html.includes('id="server-specifications"')) return html;
  const faq = /<section\b(?=[^>]*\bclass=["'][^"']*\bv-faq\b)[^>]*>/i;
  if (!faq.test(html)) return html;
  return html
    .replace(faq, (tag) => renderHostingServerFeatures(locale, value) + tag)
    .replace("</head>", '<link rel="stylesheet" href="/site/hosting-server-features.css?v=20261023-4"></head>')
    .replace("</body>", '<script src="/site/hosting-server-features.js?v=20261023-2"></script></body>');
}
