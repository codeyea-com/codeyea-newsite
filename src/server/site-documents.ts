import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { AppError } from "./errors";
import {
  documentStructuredSchema,
  jsonLdText,
} from "@/content/structured-data";
import { documentPath } from "@/content/site-routes";
import { seoTextSchema } from "@/schemas/seo-text";
import { siteOrigin } from "@/content/seo";
import { assetUrl } from "@/content/homepage-assets";
import { isIndustrySlug } from "@/content/industry-registry";
import { renderSharedShell } from "./shared-shell-render";
import {
  templateControlManifest,
  bindControls,
  applyTemplateControls,
  applyAssetControls,
  applyArtworkControls,
} from "./template-controls";
import type { TemplateControls } from "@/schemas/template-controls";
import {
  resolvePageAdditions,
  type PageAdditions,
} from "@/schemas/page-additions";
import { renderPageAdditions } from "./page-additions-render";

export const approvedTemplates: Record<string, string> = {
  "website-design": "website-design-review/website-design-interactive.html",
  "brand-design": "brand-design-review/brand-design-interactive.html",
  ecommerce: "ecommerce-review/ecommerce-interactive.html",
  "seo-geo": "seo-geo-review/seo-geo-interactive.html",
  "digital-marketing":
    "digital-marketing-review/digital-marketing-interactive.html",
  "web-mobile-apps": "web-mobile-apps-review/web-mobile-apps-interactive.html",
  "ai-automation":
    "digital-service-template-preview/ai-automation-interactive.html",
  "technical-support":
    "technical-support-review/technical-support-interactive.html",
  contact: "contact-review/contact-interactive.html",
  domains: "domain-review/domain-interactive.html",
  "website-hosting": "hosting-visual-review/website-hosting-interactive.html",
  "wordpress-hosting":
    "hosting-visual-review/wordpress-hosting-interactive.html",
  "cloud-hosting": "hosting-visual-review/cloud-hosting-interactive.html",
  "email-hosting": "email-hosting-review/email-hosting-interactive.html",
};
export type Field = { key: string; label: string; value: string };
export type TemplateImage = {
  key: string;
  mediaId: string;
  alt: string;
  decorative: boolean;
};
export type DocumentContent = {
  additions?: PageAdditions;
  controls?: TemplateControls;
  templateHash?: string;
  fields: Field[];
  description: string;
  seo?: import("@/schemas/seo-text").SeoText;
  body?: string;
  image?: string;
  images?: TemplateImage[];
  category?: string;
  tags?: string[];
};
/** Assets for these templates are intentionally public: public routes render the approved
 * templates even before a CMS publication record exists. Keep the path allowlist narrow. */
export function isPublicTemplateAsset(relative: string) {
  if (
    relative.startsWith("shared-navigation/") ||
    relative.startsWith("quote-review/")
  )
    return true;
  return Object.values(approvedTemplates).some((template) =>
    relative.startsWith(path.posix.dirname(template) + "/"),
  );
}
export function rewriteTemplateAssetCode(
  relative: string,
  source: string,
  surface: "preview" | "public",
  locale: "en" | "ar" = "en",
) {
  let text = source.replaceAll("../../public/", "/");
  for (const [slug, template] of Object.entries(approvedTemplates)) {
    const destination =
      surface === "public"
        ? (documentPath(slug, locale) ?? "/services/")
        : "/preview/pages/" + slug + (locale === "ar" ? "?locale=ar" : "");
    text = text.replaceAll("../" + template, destination);
  }
  if (surface === "public") {
    text = text
      .replaceAll(
        "/preview/services",
        documentPath("services", locale) ?? "/services/",
      )
      .replaceAll(
        "/preview/industries",
        documentPath("industries", locale) ?? "/industries/",
      )
      .replaceAll("/preview/about", documentPath("about", locale) ?? "/about/")
      .replaceAll(
        "/preview#services",
        documentPath("services", locale) ?? "/services/",
      );
  }
  const base = path.posix.dirname(relative);
  return text.replace(/(["'(])assets\//g, `$1/api/site-assets/${base}/assets/`);
}
export const templatePageTitles: Record<string, string> = {
  "website-design": "Website Design",
  "brand-design": "Brand Design",
  ecommerce: "eCommerce",
  "seo-geo": "SEO & GEO",
  "digital-marketing": "Digital Marketing",
  "web-mobile-apps": "Web & Mobile Apps",
  "ai-automation": "AI & Automation",
  "technical-support": "Technical Support",
  contact: "Contact",
  domains: "Domains",
  "website-hosting": "Website Hosting",
  "wordpress-hosting": "WordPress Hosting",
  "cloud-hosting": "Cloud Hosting",
  "email-hosting": "Email Hosting",
};
export function documentRobots(content: DocumentContent, isPublic: boolean) {
  const enabled = isPublic && process.env.SITE_INDEXING_ENABLED === "true";
  const index = enabled && content.seo?.index !== false;
  const follow = enabled && content.seo?.follow !== false;
  return `${index ? "index" : "noindex"},${follow ? "follow" : "nofollow"}`;
}
export function templateHash(html: string) {
  return createHash("sha256")
    .update(html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? html)
    .digest("hex");
}
export function bindTemplate(
  html: string,
  content: DocumentContent,
): DocumentContent {
  const hash = templateHash(html);
  if (content.templateHash && content.templateHash !== hash)
    throw new AppError(
      409,
      "The approved template changed. Review its content mapping before editing or previewing.",
    );
  const expected = extractFields(html);
  if (
    expected.length !== content.fields.length ||
    expected.some(
      (f, i) =>
        f.key !== content.fields[i].key ||
        (!content.templateHash && f.label !== content.fields[i].label),
    )
  )
    throw new AppError(
      409,
      "This draft does not match the approved template. Review the content mapping first.",
    );
  const expectedImages = extractImages(html);
  const images =
    content.images ??
    expectedImages.map((image) => ({
      key: image.key,
      mediaId: "",
      alt: image.alt,
      decorative: !image.alt.trim(),
    }));
  if (
    images.length !== expectedImages.length ||
    images.some((image, index) => image.key !== expectedImages[index].key)
  )
    throw new AppError(
      409,
      "The approved template image map changed. Review image mappings before editing.",
    );
  return { ...content, templateHash: hash, images };
}
export async function templateContent(slug: string) {
  if (!approvedTemplates[slug]) throw Error("Unknown template");
  const root = path.join(process.cwd(), "site-templates");
  const [html, header, footer] = await Promise.all([
    fs.readFile(path.join(root, approvedTemplates[slug]), "utf8"),
    fs.readFile(
      path.join(root, "shared-navigation", "site-header.html"),
      "utf8",
    ),
    fs.readFile(
      path.join(root, "shared-navigation", "site-footer.html"),
      "utf8",
    ),
  ]);
  return replaceSharedSiteShell(html, header, footer);
}
export async function bindDocumentControls(
  slug: string,
  html: string,
  content: DocumentContent,
) {
  return {
    ...content,
    additions: resolvePageAdditions(slug, content.additions),
    controls: bindControls(
      await templateControlManifest(html, approvedTemplates[slug]),
      content.controls,
    ),
  };
}
function removeMarkedElements(html: string, classes: string[]) {
  const ranges: Array<[number, number]> = [];
  for (const className of classes) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const opening = new RegExp(
      `<([a-z][\\w:-]*)\\b(?=[^>]*\\bclass=["'][^"']*\\b${escaped}\\b[^"']*["'])[^>]*>`,
      "gi",
    );
    for (const match of html.matchAll(opening)) {
      const tag = match[1];
      const tokens = new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi");
      tokens.lastIndex = match.index!;
      let depth = 0;
      let end = -1;
      let token: RegExpExecArray | null;
      while ((token = tokens.exec(html))) {
        if (/^<\//.test(token[0])) depth--;
        else if (!/\/>$/.test(token[0])) depth++;
        if (depth === 0) {
          end = tokens.lastIndex;
          break;
        }
      }
      if (end > match.index!) ranges.push([match.index!, end]);
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && range[0] <= previous[1])
      previous[1] = Math.max(previous[1], range[1]);
    else merged.push([...range]);
  }
  for (const [start, end] of merged.reverse())
    html = html.slice(0, start) + html.slice(end);
  return html;
}
function removeScriptsContaining(html: string, marker: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) =>
    script.includes(marker) ? "" : script,
  );
}
export function replaceSharedSiteShell(
  html: string,
  header: string,
  footer: string,
) {
  const withHeader = html.replace(
    /<header\b[\s\S]*?<\/header>/i,
    header.trim(),
  );
  return withHeader.replace(/<footer\b[\s\S]*?<\/footer>/i, footer.trim());
}
/** Keep draft-only portfolio, testimonial and sample-brand content out of public templates. */
export function sanitizeUnapprovedPublicContent(
  html: string,
  contactHref = "/contact/",
) {
  html = removeMarkedElements(html, [
    "b-logos",
    "b-testimonials",
    "b-proof-stack",
    "ai-stories",
    "ai-story-logos",
    "ai-logo-note",
  ]);
  // The deleted story carousel has a dedicated initializer that assumes its DOM exists.
  html = removeScriptsContaining(html, "function storiesMotion()");
  html = html.replace(
    /<section\b(?=[^>]*\bid=["']ds-testimonials["'])[^>]*>[\s\S]*?<\/section>/gi,
    "",
  );
  // These projects are explicitly unapproved placeholders; keep the surrounding service design intact.
  if (/Project content pending|Approved project material pending/i.test(html)) {
    html = removeMarkedElements(html, ["ds-works"]);
    // This enhancement also assumes that the draft-only portfolio section is present.
    html = removeScriptsContaining(html, "function worksMotion()");
  }
  html = html.replace(
    /\balt=(["'])Temporary local image\s*[—–-]\s*image selection pending\1/gi,
    'alt=""',
  );
  // Keep the canonical footer composition on React and document routes alike.
  return html.replace(/<address\b[^>]*>[\s\S]*?<\/address>/gi, (block) =>
    /to be confirmed/i.test(block) ? "" : block,
  );
}
function mapMain(html: string, fn: (text: string, index: number) => string) {
  let i = 0;
  return html.replace(/<main\b[\s\S]*?<\/main>/, (main) =>
    main.replace(
      /(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<svg\b[\s\S]*?<\/svg>|<!--[^]*?-->|<[^>]+>)|([^<]+)/g,
      (all, tag, text) => tag || (!text.trim() ? text : fn(text, i++)),
    ),
  );
}
export function extractFields(html: string) {
  const fields: Field[] = [];
  mapMain(html, (text, i) => {
    const value = text
      .replaceAll("&amp;", "&")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&#39;", "'");
    fields.push({ key: "text-" + i, label: value.trim().slice(0, 70), value });
    return text;
  });
  return fields;
}
export function extractImages(html: string) {
  const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? "";
  const images: Omit<TemplateImage, "mediaId" | "decorative">[] = [];
  for (const tag of main.matchAll(/<img\b[^>]*>/gi)) {
    const alt = tag[0].match(/\balt=["']([^"']*)["']/i)?.[1] ?? "";
    images.push({
      key: "image-" + images.length,
      alt: alt
        .replaceAll("&amp;", "&")
        .replaceAll("&quot;", '"')
        .replaceAll("&#39;", "'"),
    });
  }
  return images;
}
export function extractTemplateMediaIds(html: string) {
  const ids = new Set<string>();
  for (const match of html.matchAll(
    /\/api\/media\/(media_[a-z\d_-]+)(?:\/[^"'?#]*)?(?:[?#][^"']*)?["']/gi,
  ))
    ids.add(match[1]);
  return ids;
}
export function templatePageDraft(slug: string, html: string) {
  const title = templatePageTitles[slug];
  const description =
    html
      .match(
        /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i,
      )?.[1]
      ?.trim() || `Explore ${title || slugTitle(slug)} from CODEYEA.`;
  const path = documentPath(slug, "en");
  if (!title || !path)
    throw new AppError(
      400,
      "This template has no registered English page route.",
    );
  const content = bindTemplate(html, {
    fields: extractFields(html),
    description,
    seo: {
      title: `${title} | CODEYEA`,
      description,
      canonicalPath: path,
      index: false,
      follow: true,
    },
  });
  return { title, content };
}
/** Replace private design-review destinations with registered public site routes. */
export function rewritePublicDocumentLinks(html: string, locale: "en" | "ar") {
  const prefix = locale === "ar" ? "/ar" : "";
  const route = (target: string) =>
    target ? `${prefix}/${target.replace(/^\/+|\/+$/g, "")}/` : prefix || "/";
  for (const [filename, slug] of [
    ["website-hosting-interactive.html", "website-hosting"],
    ["wordpress-hosting-interactive.html", "wordpress-hosting"],
    ["cloud-hosting-interactive.html", "cloud-hosting"],
  ] as const) {
    html = html.replaceAll(`href="${filename}"`, `href="${route(slug)}"`);
  }
  html = html.replace(
    /href="\/preview#industry-list"([^>]*)>([^<]+)<\/a>/g,
    (all, attributes, label) => {
      const industries: Record<string, string> = {
        "Healthcare &amp; Aesthetic Clinics": "healthcare",
        Construction: "construction",
        "Real Estate": "real-estate",
        eCommerce: "e-commerce",
        Legal: "legal",
        "Oil &amp; Gas": "oil-and-gas",
        Roofing: "roofing",
        "Small Business": "small-business",
      };
      const target = industries[label.trim()];
      return target
        ? 'href="' +
            route("industries/" + target) +
            '"' +
            attributes +
            ">" +
            label +
            "</a>"
        : all;
    },
  );
  html = html.replace(
    /href="\/preview\/industries\/([a-z0-9-]+)"/g,
    (_all, target: string) =>
      isIndustrySlug(target)
        ? 'href="' + route("industries/" + target) + '"'
        : 'href="' + route("industries") + '"',
  );
  html = html.replace(
    /href="\/preview(?:\/pages)?\/([a-z0-9-]+)(?:\?locale=(?:en|ar))?"/g,
    (_all, target: string) => {
      if (
        target === "about" ||
        target === "services" ||
        target === "industries"
      )
        return 'href="' + route(target) + '"';
      if (target === "website-hosting") return 'href="' + route(target) + '"';
      return documentPath(target, locale) && approvedTemplates[target]
        ? 'href="' + route(target) + '"'
        : 'href="' + route("services") + '"';
    },
  );
  html = html.replace(
    /href="\/preview#services"/g,
    'href="' + route("services") + '"',
  );
  html = html.replace(
    /href="\/preview#service-(\d+)"/g,
    (_all, n: string) => 'href="' + prefix + "/#service-" + n + '"',
  );
  html = html.replace(
    /href="\/preview#hosting"/g,
    'href="' + route("website-hosting") + '"',
  );
  html = html.replace(
    /href="\/preview#work"/g,
    'href="' + route("about") + '#work"',
  );
  html = html.replace(/href="\/preview(?:\/)?"/g, 'href="' + route("") + '"');
  html = html.replace(
    /href="https:\/\/codeyea\.com\/contact\/"/g,
    'href="' + route("contact") + '"',
  );
  html = html.replace(
    /<a\b[^>]*href=["']\/admin(?:[?#][^"']*)?["'][^>]*>[\s\S]*?<\/a>/gi,
    "",
  );
  return html;
}
export function applyTemplateImageOverrides(
  html: string,
  images: TemplateImage[] = [],
) {
  let index = 0;
  return html.replace(/<main\b[\s\S]*?<\/main>/, (main) =>
    main.replace(/<img\b[^>]*>/gi, (tag) => {
      const override = images[index++];
      if (!override?.mediaId) return tag;
      let updated = tag
        .replace(
          /\bsrc=(['"])[^'"]*\1/i,
          'src="' + escapeHtml(assetUrl(override.mediaId)) + '"',
        )
        .replace(/\s+srcset=(['"])[^'"]*\1/i, "");
      if (!/\bsrc=/i.test(updated))
        updated = updated.replace(
          /<img\b/i,
          '<img src="' + escapeHtml(assetUrl(override.mediaId)) + '"',
        );
      const alt = override.decorative ? "" : override.alt;
      if (/\balt=(['"])[^'"]*\1/i.test(updated))
        updated = updated.replace(
          /\balt=(['"])[^'"]*\1/i,
          'alt="' + escapeHtml(alt) + '"',
        );
      else
        updated = updated.replace(
          /<img\b/i,
          '<img alt="' + escapeHtml(alt) + '"',
        );
      return updated;
    }),
  );
}
export async function renderDocument(
  slug: string,
  content: DocumentContent,
  locale: string,
  title?: string,
  options: {
    public?: boolean;
    alternates?: Partial<Record<"en" | "ar", string>>;
    shared?: unknown;
  } = {},
) {
  let html = await templateContent(slug);
  const publicLocalePrefix = locale === "ar" ? "/ar" : "";
  const publicRoute = (target: string) =>
    options.public
      ? `${publicLocalePrefix}/${target.replace(/^\/+|\/+$/g, "")}/`
      : `/preview/pages/${target.replace(/^\/+|\/+$/g, "")}${locale === "ar" ? "?locale=ar" : ""}`;
  content = bindTemplate(html, content);
  content = await bindDocumentControls(slug, html, content);
  html = applyTemplateControls(html, content.controls);
  let inlineIndex = 0;
  html = html.replace(
    /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (_all, start, body, end) =>
      start +
      applyArtworkControls(
        body,
        approvedTemplates[slug] + "#inline-" + inlineIndex++,
        content.controls,
      ) +
      end,
  );
  if (slug === "contact")
    html = html.replaceAll(
      "https://codeyea.com/wp-content/uploads/2021/06/tree-grass-architecture-house-perspective-building-1099275-pxhere.com@2x-1.jpg",
      "/site/contact-hero-original.jpg",
    );
  const shell = await renderSharedShell(
    options.shared,
    !options.public,
    locale,
  );
  html = html
    .replace(/<header\b[^>]*class="hp-header[^]*?<\/header>/, shell.header)
    .replace(
      /<footer\b[^>]*class="[^"]*hp-footer[^]*?<\/footer>/,
      shell.footer,
    );
  // Frozen menu builders would otherwise replace the canonical header again.
  html = html.replace(
    /<script\b[^>]*src="[^"]*shared-navigation\/hosting-menu\.js"[^>]*><\/script>/g,
    "",
  );
  const values = new Map(content.fields.map((f) => [f.key, f.value]));
  const original = new Map(extractFields(html).map((f) => [f.key, f.value]));
  html = mapMain(html, (text, i) =>
    values.has("text-" + i) &&
    values.get("text-" + i) !== original.get("text-" + i)
      ? escapeHtml(values.get("text-" + i)!)
      : text,
  );
  // Preserve the approved animation while sourcing its heading from the CMS text.
  // The template originally replaced this heading with a hard-coded string on load.
  html = html.replace(
    /(function overviewMotion\(\)\{[\s\S]*?const heading=section.querySelector\('h2'\);)heading.innerHTML=('(?:[^'\\]|\\.)*');/,
    (_, prefix, markup) =>
      prefix +
      "const cmsLines=heading.innerHTML.split(/<br\\s*\\/?>/i);heading.innerHTML=" +
      markup +
      ";if(cmsLines.length===2){const lines=heading.querySelectorAll('.ai-intro-line');lines[0].innerHTML=cmsLines[0];const holder=document.createElement('span');holder.innerHTML=cmsLines[1];const text=holder.textContent.trim(),cut=text.lastIndexOf(' ');lines[1].firstChild.textContent=cut<0?'':text.slice(0,cut+1);heading.querySelector('.ai-rotator>span').textContent=text.slice(cut+1);}",
  );
  html = html.replace(
    /(words=\[[^\]]+\],slot=heading.querySelector\('\.ai-rotator'\);)/,
    "$1words[0]=slot.textContent;heading.querySelector('.ai-sr-only').textContent=words.join(', ');",
  );
  const arabicWords: Record<string, string[]> = {
    "ai-automation": ["مترابطة", "واضحة", "عملية"],
    "technical-support": ["بثقة", "بانتظام", "بسلاسة"],
    "web-mobile-apps": ["مترابطة", "عملية", "مرنة"],
    "digital-marketing": ["هدف", "أثر", "قيمة"],
    "seo-geo": ["مفيدة", "واضحة", "موثوقة"],
  };
  const introWords =
    content.additions?.introWords ??
    (locale === "ar" ? arabicWords[slug] : undefined);
  if (introWords)
    html = html.replace(
      /words=\[[^\]]+\](?=,slot=heading)/,
      "words=" + JSON.stringify(introWords).replaceAll("<", "\\u003c"),
    );
  html = html.replace(
    /<html([^>]*)lang="[^"]*"([^>]*)>/,
    '<html$1lang="' +
      locale +
      '" dir="' +
      (locale === "ar" ? "rtl" : "ltr") +
      '"$2>',
  );
  // Keep approved templates server-side. Only allowlisted assets are exposed through the private asset route.
  if (options.public) {
    html = rewritePublicDocumentLinks(html, locale as "en" | "ar");
    html = html.replace(
      /<div\b(?=[^>]*\bclass=["'][^"']*\babout-preview-banner\b)[^>]*>[\s\S]*?<\/div>/i,
      "",
    );
  }
  html = applyTemplateImageOverrides(html, content.images);
  html = html.replace(
    /\/api\/media\/(media_[0-9a-f-]{36})\/(?:thumb|small|medium|large)/g,
    (_match, id: string) => assetUrl(id),
  );
  if (!options.public) {
    html = html.replaceAll("/preview#services", "/preview/services");
    html = html.replace(
      /href="\/preview\/(?:pages\/)?([a-z0-9-]+)(?:\?locale=(?:en|ar))?"/g,
      (_all, target: string) => 'href="' + publicRoute(target) + '"',
    );
  }
  const industries: Record<string, string> = {
    "Healthcare &amp; Aesthetic Clinics": "healthcare",
    Construction: "construction",
    "Real Estate": "real-estate",
    eCommerce: "e-commerce",
    Legal: "legal",
    "Oil &amp; Gas": "oil-and-gas",
    Roofing: "roofing",
    "Small Business": "small-business",
  };
  if (!options.public)
    html = html.replace(
      /href="\/preview#industry-list"([^>]*)>([^<]+)<\/a>/g,
      (all, attributes, label) => {
        const target = industries[label.trim()];
        if (!target) return all;
        const destination = options.public
          ? `${publicLocalePrefix}/industries/${target}/`
          : `/preview/industries/${target}`;
        return 'href="' + destination + '"' + attributes + ">" + label + "</a>";
      },
    );
  html = html
    .replaceAll("../../public/", "/")
    .replaceAll("http://127.0.0.1:3002/", "/");
  for (const [id, file] of Object.entries(approvedTemplates))
    html = html
      .replaceAll("../" + file, publicRoute(id))
      .replaceAll(
        'href="' + path.posix.basename(file) + '"',
        'href="' + publicRoute(id) + '"',
      );
  html = html.replace(
    /(?:src|href)="(\.\.\/[^"?#]+)([?#][^"]*)?"/g,
    (m, relative, suffix = "") => {
      const resolved = path.posix.normalize(
        path.posix.join(path.posix.dirname(approvedTemplates[slug]), relative),
      );
      const assetSurface =
        options.public && /\.(?:css|js)$/i.test(relative)
          ? (suffix ? "&" : "?") +
            "surface=public" +
            (locale === "ar" ? "&locale=ar" : "")
          : "";
      return m.replace(
        relative + suffix,
        "/api/site-assets/" + resolved + suffix + assetSurface,
      );
    },
  );
  html = html.replace(
    /src="assets\/([^"?#]+)"/g,
    (_, asset) =>
      'src="/api/site-assets/' +
      path.posix.dirname(approvedTemplates[slug]) +
      "/assets/" +
      asset +
      '"',
  );
  const pageTitle =
    content.seo?.title?.trim() ||
    (title ? title + " | CODEYEA" : slugTitle(slug) + " | CODEYEA");
  const description =
    content.seo?.description?.trim() ||
    content.description ||
    `Explore ${slugTitle(slug)} from CODEYEA.`;
  const publicPath = documentPath(slug, locale);
  const robots = documentRobots(content, options.public === true);
  const seo = seoTextSchema.parse(
    content.seo ?? {
      title: pageTitle.replace(/ \| CODEYEA$/, ""),
      description,
    },
  );
  const canonicalUrl = new URL(publicPath || "/", siteOrigin).href;
  const socialTitle = seo.socialTitle?.trim() || pageTitle;
  const socialDescription = seo.socialDescription?.trim() || description;
  const socialImageUrl = seo.socialImage?.mediaId
    ? new URL(assetUrl(seo.socialImage.mediaId), siteOrigin).href
    : "";
  if (title)
    html = html.replace(
      /<title>[^]*?<\/title>/,
      "<title>" + escapeHtml(pageTitle) + "</title>",
    );
  html = replaceNamedMeta(
    html,
    "robots",
    '<meta name="robots" content="' + robots + '">',
  );
  html = replaceNamedMeta(
    html,
    "description",
    '<meta name="description" content="' + escapeHtml(description) + '">',
  );
  const canonicalTag =
    '<link rel="canonical" href="' + escapeHtml(canonicalUrl) + '">';
  html = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i.test(html)
    ? html.replace(
        /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i,
        canonicalTag,
      )
    : html.replace("</head>", canonicalTag + "</head>");
  if (options.public && options.alternates) {
    const alternateTags = Object.entries(options.alternates)
      .map(
        ([language, url]) =>
          '<link rel="alternate" hreflang="' +
          language +
          '" href="' +
          escapeHtml(url) +
          '">',
      )
      .join("");
    const defaultUrl = options.alternates.en
      ? '<link rel="alternate" hreflang="x-default" href="' +
        escapeHtml(options.alternates.en) +
        '">'
      : "";
    html = html.replace("</head>", alternateTags + defaultUrl + "</head>");
  }
  html = replacePropertyMeta(
    html,
    "og:title",
    '<meta property="og:title" content="' + escapeHtml(socialTitle) + '">',
  );
  html = replacePropertyMeta(
    html,
    "og:description",
    '<meta property="og:description" content="' +
      escapeHtml(socialDescription) +
      '">',
  );
  html = replacePropertyMeta(
    html,
    "og:type",
    '<meta property="og:type" content="website">',
  );
  html = replacePropertyMeta(
    html,
    "og:site_name",
    '<meta property="og:site_name" content="CODEYEA">',
  );
  if (publicPath)
    html = replacePropertyMeta(
      html,
      "og:url",
      '<meta property="og:url" content="' + escapeHtml(canonicalUrl) + '">',
    );
  if (socialImageUrl)
    html = replacePropertyMeta(
      html,
      "og:image",
      '<meta property="og:image" content="' + escapeHtml(socialImageUrl) + '">',
    );
  html = replaceNamedMeta(
    html,
    "twitter:card",
    '<meta name="twitter:card" content="summary">',
  );
  html = replaceNamedMeta(
    html,
    "twitter:title",
    '<meta name="twitter:title" content="' + escapeHtml(pageTitle) + '">',
  );
  html = replaceNamedMeta(
    html,
    "twitter:description",
    '<meta name="twitter:description" content="' +
      escapeHtml(socialDescription) +
      '">',
  );
  if (socialImageUrl)
    html = replaceNamedMeta(
      html,
      "twitter:card",
      '<meta name="twitter:card" content="summary_large_image">',
    );
  if (socialImageUrl)
    html = replaceNamedMeta(
      html,
      "twitter:image",
      '<meta name="twitter:image" content="' +
        escapeHtml(socialImageUrl) +
        '">',
    );
  html = replaceNamedMeta(
    html,
    "twitter:title",
    '<meta name="twitter:title" content="' + escapeHtml(socialTitle) + '">',
  );
  const schema = documentStructuredSchema(slug, pageTitle, description, locale);
  if (schema) {
    const script =
      '<script type="application/ld+json">' + jsonLdText(schema) + "</script>";
    const existing =
      /<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/i;
    html = existing.test(html)
      ? html.replace(existing, script)
      : html.replace("</head>", script + "</head>");
  }
  // The new quote panel owns submission on integrated previews; old local-preview handlers are intercepted.
  html = html.replace(
    "</head>",
    '<link rel="stylesheet" href="/site/shared-layout.css"><link rel="stylesheet" href="/site/quote-panel.css"><script>window.CODEYEA_LEADS_ENABLED=true</script></head>',
  );
  const shellStyles = await Promise.all(
    [
      "homepage-header-final.css",
      "approved-mega.css",
      "homepage-footer.css",
    ].map((file) =>
      fs.readFile(path.join(process.cwd(), "src/styles", file), "utf8"),
    ),
  );
  html = html.replace(
    "</head>",
    "<style data-shared-shell>" + shellStyles.join("\n") + "</style></head>",
  );
  html = html.replace(
    "</body>",
    (html.includes("quote-review/quote-panel.js")
      ? ""
      : '<script src="/api/site-assets/quote-review/quote-panel.js"></script>') +
      '<script src="/site/lead-forms.js"></script><script src="/site/shared-layout.js"></script></body>',
  );
  if (!html.includes("quote-panel.js")) {
    html = html.replace(
      "</head>",
      '<link rel="stylesheet" href="/api/site-assets/quote-review/quote-panel.css"><script>window.CODEYEA_LEADS_ENABLED=true</script></head>',
    );
    html = html.replace(
      "</body>",
      '<script src="/api/site-assets/quote-review/quote-panel.js?surface=public"></script></body>',
    );
  }
  const contactHref = publicRoute("contact");
  if (options.public) {
    html = sanitizeUnapprovedPublicContent(html, contactHref);
  }
  html = html.replace(/<a\b[^>]*\bhp-header-quote\b[^>]*>/gi, (tag) =>
    tag.replace(/\bhref="[^"]*"/i, 'href="' + contactHref + '#contact-form"'),
  );
  html = html.replace(
    /<form\b(?=[^>]*\bclass="[^"]*\bct-form\b)[^>]*>/i,
    (tag) =>
      /\bid=/.test(tag) ? tag : tag.replace(/>$/, ' id="contact-form">'),
  );
  const navigationPatterns = [
    {
      pattern:
        /(<nav\b(?=[^>]*class="[^"]*\bhp-desktop-nav\b[^"]*")[^>]*>)([\s\S]*?)(<\/nav>)/i,
      contact:
        '<span class="hp-nav-item"><a href="' +
        contactHref +
        '">Contact</a></span>',
    },
    {
      pattern:
        /(<nav\b(?=[^>]*aria-label="Mobile navigation")[^>]*>)([\s\S]*?)(<\/nav>)/i,
      contact: '<a href="' + contactHref + '">Contact</a>',
    },
  ];
  for (const { pattern, contact } of navigationPatterns) {
    html = html.replace(pattern, (_all, start, body, end) => {
      const withoutWork = body
        .replace(
          /<span\b(?=[^>]*class="[^"]*\bhp-nav-item\b[^"]*")[^>]*>\s*<a\b[^>]*>\s*Work\s*<\/a>\s*<\/span>/gi,
          "",
        )
        .replace(/<a\b[^>]*>\s*Work\s*<\/a>/gi, "");
      return (
        start +
        (/href="[^"]*\/contact(?:[/?#"])/.test(withoutWork) ||
        /(?:Contact|تواصل معنا)<\/a>/.test(withoutWork) ||
        withoutWork.includes(contactHref.replaceAll("&", "&amp;"))
          ? withoutWork
          : withoutWork + contact) +
        end
      );
    });
  }
  html = html.replace(
    /(<nav\b(?=[^>]*aria-label="Footer navigation")[^>]*>)([\s\S]*?)(<\/nav>)/i,
    (_all, start, body, end) =>
      start + body.replace(/<a\b[^>]*>\s*Work\s*<\/a>/gi, "") + end,
  );
  if (
    /<script\b(?=[^>]*\bdata-integrated-hero\b)(?=[^>]*\bsrc=)[^>]*><\/script>/i.test(
      html,
    )
  ) {
    const markHero = (className: string) => {
      const pattern = new RegExp(
        `<section\\b(?=[^>]*\\bclass=["'][^"']*\\b${className}\\b[^"']*["'])[^>]*>`,
        "i",
      );
      html = html.replace(pattern, (tag) =>
        /\bdata-hero-upgrade-pending\b/.test(tag)
          ? tag
          : tag.replace(/>$/, " data-hero-upgrade-pending>"),
      );
    };
    markHero("about-hero");
    markHero("b-hero");
    const reveal =
      "document.querySelectorAll('[data-hero-upgrade-pending]').forEach(function(node){node.removeAttribute('data-hero-upgrade-pending')})";
    html = html.replace(
      /<script\b(?=[^>]*\bdata-integrated-hero\b)(?=[^>]*\bsrc=)[^>]*>/i,
      (tag) => tag.replace(/>$/, ` onload="${reveal}" onerror="${reveal}">`),
    );
    const revealStyle =
      "<style>[data-hero-upgrade-pending]{visibility:hidden!important}</style>";
    html = html.replace("</head>", revealStyle + "</head>");
  }
  html = html
    .replaceAll("/brand/logo-dark.png", "/brand/logo-animated-dark.svg")
    .replaceAll("/brand/logo-light.png", "/brand/logo-animated-light.svg");
  html = html.replace(
    "</head>",
    '<link rel="stylesheet" href="/site/page-texture.css"></head>',
  );
  // Bust the shared navigation asset cache when the shell styles change; static
  // template pages otherwise keep an older menu/header layout after deployment.
  if (options.public) {
    html = html
      .replace(
        "/api/site-assets/shared-navigation/hosting-menu.css?surface=public",
        "/api/site-assets/shared-navigation/hosting-menu.css?surface=public&v=20261009-1",
      )
      .replace(
        "/api/site-assets/shared-navigation/hosting-menu.js?surface=public",
        "/api/site-assets/shared-navigation/hosting-menu.js?surface=public&v=20261009-1",
      );
  }
  if (slug === "domains")
    html = html.replace(
      "</body>",
      '<script src="/site/domain-orbits.js"></script></body>',
    );
  html = renderPageAdditions(
    html,
    slug,
    content.additions,
    !options.public,
    locale,
  );
  html = html.replace(
    /(<div class="hp-utility"><div class="hp-container">)<a[^>]*>[\s\S]*?<\/a>/,
    '$1<span class="cy-language-slot"></span>',
  );
  html = html
    .replace(
      "</head>",
      '<link rel="stylesheet" href="/site/post-launch.css"></head>',
    )
    .replace("</body>", '<script src="/site/post-launch.js"></script></body>');
  html = applyAssetControls(html, content.controls);
  html = html.replace(
    /(\/(?:api\/site-assets)\/[^"'<>\s]+\.(?:js|css))([^"'<>\s]*)(?=["'])/g,
    (all, url, suffix) =>
      url.startsWith(
        "/api/site-assets/" + path.posix.dirname(approvedTemplates[slug]) + "/",
      )
        ? url +
          suffix +
          (suffix.includes("?") ? "&" : "?") +
          "cms=" +
          encodeURIComponent(slug) +
          "&locale=" +
          encodeURIComponent(locale)
        : all,
  );
  html = html.replace(
    "</head>",
    '<style>[data-cms-hidden="true"]{display:none!important}</style></head>',
  );
  return html;
}
function slugTitle(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
export function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
function replaceNamedMeta(html: string, name: string, tag: string) {
  const existing = new RegExp(
    "<meta\\b(?=[^>]*\\bname=[\"\\']" + name + "[\"\\'])[^>]*>",
    "i",
  );
  return existing.test(html)
    ? html.replace(existing, tag)
    : html.replace("</head>", tag + "</head>");
}
function replacePropertyMeta(html: string, property: string, tag: string) {
  const existing = new RegExp(
    "<meta\\b(?=[^>]*\\bproperty=[\"\\']" + property + "[\"\\'])[^>]*>",
    "i",
  );
  return existing.test(html)
    ? html.replace(existing, tag)
    : html.replace("</head>", tag + "</head>");
}
