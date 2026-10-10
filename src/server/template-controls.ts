import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { AppError } from "./errors";
import { assetUrl } from "@/content/homepage-assets";
import type { TemplateControls } from "@/schemas/template-controls";

const decode = (s: string) =>
  s
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const mainOf = (html: string) =>
  html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? "";
const tokens =
  /<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<svg\b[\s\S]*?<\/svg>|<!--[^]*?-->|<[^>]+>/gi;
function keyFor(source: string, index: number) {
  return (
    createHash("sha256").update(source).digest("hex").slice(0, 12) + "-" + index
  );
}
function publicSource(base: string, source: string) {
  if (
    source ===
    "https://codeyea.com/wp-content/uploads/2021/06/tree-grass-architecture-house-perspective-building-1099275-pxhere.com@2x-1.jpg"
  )
    return "/site/contact-hero-original.jpg";
  if (source.startsWith("../../public/"))
    return "/" + source.slice("../../public/".length);
  if (source.startsWith("/") || /^https?:/.test(source)) return source;
  return (
    "/api/site-assets/" + path.posix.normalize(path.posix.join(base, source))
  );
}
export function extractArtworkText(source: string, id: string) {
  const out: {
    key: string;
    label: string;
    value: string;
    raw: string;
    offset: number;
    literal?: boolean;
  }[] = [];
  for (const match of source.matchAll(
    /<\/?[a-z][\w:-]*\b[^<>]*>([^<>\r\n]+)(?=<\/?[a-z][\w:-]*\b)/gi,
  )) {
    const raw = match[1];
    if (
      !/[a-zA-Z\u0600-\u06ff0-9]/.test(raw) ||
      /[\\'`{}]|\+\s*[a-z]/.test(raw) ||
      raw.length > 5000
    )
      continue;
    const value = decode(raw);
    out.push({
      key: "art-" + keyFor(id, out.length),
      label: value.trim().slice(0, 200),
      value,
      raw,
      offset: match.index! + match[0].length - raw.length,
    });
  }
  // Approved Web & Mobile Apps product data also drives click/automatic transitions.
  if (id.endsWith("web-mobile-apps-hero-concept-site.js")) {
    const data = source.match(/const data=\{[^;]+\};/);
    if (data)
      for (const row of data[0].matchAll(
        /(\w+):\[('([^'\\]*)'),('([^'\\]*)'),(\d+(?:\.\d+)?),/g,
      )) {
        const start = data.index! + row.index!;
        const literals = [
          {
            raw: row[2],
            value: row[3],
            label: "name",
            offset: start + row[0].indexOf(row[2]),
          },
          {
            raw: row[4],
            value: row[5],
            label: "description",
            offset:
              start +
              row[0].indexOf(row[4], row[0].indexOf(row[2]) + row[2].length),
          },
          {
            raw: row[6],
            value: row[6],
            label: "price",
            offset: start + row[0].lastIndexOf(row[6]),
          },
        ];
        for (const item of literals)
          out.push({
            key:
              (item.label === "price" ? "data-number-" : "data-text-") +
              keyFor(id, out.length),
            label: row[1] + " " + item.label,
            value: item.value,
            raw: item.raw,
            offset: item.offset,
            literal: true,
          });
      }
  }
  return out;
}
/** Fixed-source manifest: editors can change values, never executable selectors or code. */
export async function templateControlManifest(html: string, template: string) {
  const main = mainOf(html),
    base = path.posix.dirname(template),
    root = path.resolve("site-templates");
  const sections: TemplateControls["sections"] = [],
    links: TemplateControls["links"] = [],
    assets: TemplateControls["assets"] = [],
    artworkText: TemplateControls["artworkText"] = [];
  for (const match of main.matchAll(tokens)) {
    const tag = match[0];
    if (/^<section\b/i.test(tag)) {
      const rest = main.slice(match.index! + tag.length),
        heading = rest
          .match(/<(?:h[1-6])\b[^>]*>([\s\S]*?)<\/(?:h[1-6])>/i)?.[1]
          ?.replace(/<[^>]+>/g, " ")
          .trim();
      sections.push({
        key: "section-" + sections.length,
        label: decode(heading ?? "Section " + (sections.length + 1)).slice(
          0,
          200,
        ),
        enabled: true,
      });
    }
    if (/^<a\b/i.test(tag)) {
      const href = tag.match(/\bhref=(['"])(.*?)\1/i)?.[2];
      if (!href) continue;
      // Review links are normalized to their existing public destination in the UI.
      const rest = main.slice(match.index! + tag.length),
        label = rest
          .slice(0, rest.indexOf("</a>"))
          .replace(/<[^>]+>/g, " ")
          .trim();
      links.push({
        key: "link-" + links.length,
        label: decode(label || href).slice(0, 200),
        href: decode(href),
      });
    }
  }
  const sources: { id: string; text: string; base: string }[] = [
    ...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi),
  ].map((match, index) => ({
    id: template + "#inline-" + index,
    text: match[1],
    base,
  }));
  const files = new Set(
    [
      ...html.matchAll(
        /(?:src|href)=(['"])([^'"?#]+\.(?:js|css))(?:[^'"]*)\1/gi,
      ),
    ].map((m) => m[2]),
  );
  for (const reference of files) {
    if (
      reference.startsWith("/") ||
      /^https?:/.test(reference) ||
      reference.includes("shared-navigation/") ||
      reference.includes("quote-review/")
    )
      continue;
    const relative = path.posix.normalize(path.posix.join(base, reference)),
      absolute = path.resolve(root, relative);
    if (!absolute.startsWith(root + path.sep)) continue;
    try {
      sources.push({
        id: relative,
        text: await fs.readFile(absolute, "utf8"),
        base: path.posix.dirname(relative),
      });
    } catch {
      /* Optional legacy stylesheet is not a content source. */
    }
  }
  const known = new Set<string>();
  for (const source of [{ id: template, text: main, base }, ...sources]) {
    for (const match of source.text.matchAll(
      /(?:["'(=])([^"'()<>\s]+\.(?:png|jpe?g|webp|svg))(?:[?#][^"'()<>\s]*)?(?=["')\s>])/gi,
    )) {
      const url = publicSource(source.base, match[1]);
      const family = url.includes("web-mobile-apps-review/")
        ? url.replace(/-(420|720)(?=\.(?:png|jpe?g|webp)$)/i, "-responsive")
        : url;
      if (known.has(family)) continue;
      known.add(family);
      const imageTag = [...source.text.matchAll(/<img\b[^>]*>/gi)].find(
        (match) => {
          const src = match[0].match(/\bsrc=(['"])(.*?)\1/i)?.[2];
          return !!src && publicSource(source.base, src) === url;
        },
      )?.[0];
      const alt = decode(imageTag?.match(/\balt=(['"])(.*?)\1/i)?.[2] ?? "");
      assets.push({
        key: "asset-" + assets.length,
        label: path.posix.basename(match[1]).slice(0, 200),
        source: url,
        mediaId: "",
        alt,
        decorative: !alt.trim(),
      });
    }
    if (source.id !== template && source.id.endsWith(".css")) continue;
    if (source.id !== template)
      artworkText.push(
        ...extractArtworkText(source.text, source.id).map(
          ({ key, label, value }) => ({ key, label, value }),
        ),
      );
  }
  return { sections, links, assets, artworkText };
}
export function bindControls(
  expected: TemplateControls,
  actual?: TemplateControls,
): TemplateControls {
  if (!actual) return expected;
  for (const field of ["sections", "links", "assets", "artworkText"] as const) {
    if (
      actual[field].length !== expected[field].length ||
      actual[field].some(
        (entry, index) => entry.key !== expected[field][index].key,
      )
    )
      throw new AppError(
        409,
        "The template controls changed. Reload this page before saving.",
      );
  }
  if (
    actual.assets.some(
      (entry, index) => entry.source !== expected.assets[index].source,
    )
  )
    throw new AppError(400, "Image source identities cannot be changed.");
  return actual;
}
export function applyTemplateControls(
  html: string,
  controls?: TemplateControls,
) {
  if (!controls) return html;
  let section = 0,
    link = 0;
  return html.replace(/<main\b[\s\S]*?<\/main>/, (main) =>
    main.replace(tokens, (tag) => {
      if (/^<section\b/i.test(tag)) {
        const value = controls.sections[section++];
        if (value?.enabled === false)
          return tag.replace(/>$/, ' hidden data-cms-hidden="true">');
      }
      if (/^<a\b/i.test(tag) && /\bhref=(['"])(.*?)\1/i.test(tag)) {
        const value = controls.links[link++];
        if (value)
          return tag.replace(
            /\bhref=(['"])(.*?)\1/i,
            'href="' + escape(value.href) + '"',
          );
      }
      return tag;
    }),
  );
}
export function applyArtworkControls(
  source: string,
  id: string,
  controls?: TemplateControls,
) {
  if (!controls) return source;
  const values = new Map(
    controls.artworkText.map((entry) => [entry.key, entry.value]),
  );
  const originals = extractArtworkText(source, id);
  for (const item of originals.sort((a, b) => b.offset - a.offset)) {
    const value = values.get(item.key);
    if (value === undefined || value === item.value) continue;
    // HTML entities keep owner text inert inside single-, double- and backtick JS strings.
    const encoded = item.literal
      ? item.key.startsWith("data-number-")
        ? String(Number(value))
        : JSON.stringify(value).replaceAll("<", "\\u003c")
      : escape(value)
          .replaceAll("\\", "&#92;")
          .replaceAll("`", "&#96;")
          .replaceAll("$", "&#36;")
          .replaceAll("\n", "&#10;")
          .replaceAll("\r", "&#13;");
    source =
      source.slice(0, item.offset) +
      encoded +
      source.slice(item.offset + item.raw.length);
  }
  if (id.endsWith("web-mobile-apps-hero-concept-site.js"))
    source = source.replaceAll(
      "+x.name+",
      '+String(x.name).replace(/[&<>"\x27]/g,c=>"&#"+c.charCodeAt(0)+";")+',
    );
  return source;
}
export function applyAssetControls(
  source: string,
  controls?: TemplateControls,
) {
  if (!controls) return source;
  for (const image of controls.assets) {
    const escaped = image.source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = image.source.includes("web-mobile-apps-review/")
      ? escaped.replace(
          /-(420|720)(?=\\\.(?:png|jpe?g|webp)$)/i,
          "-(?:420|720)",
        )
      : escaped;
    const matcher = new RegExp(pattern, "g");
    source = source.replace(/<img\b[^>]*>/gi, (tag) => {
      if (!new RegExp(pattern).test(tag)) return tag;
      if (image.alt !== undefined || image.decorative !== undefined) {
        tag = tag.replace(/\s+alt=(['"])[^]*?\1/i, "");
        tag = tag.replace(
          /\s*\/?>$/,
          ' alt="' +
            escape(image.decorative ? "" : (image.alt ?? ""))
              .replaceAll("\\", "&#92;")
              .replaceAll("`", "&#96;")
              .replaceAll("$", "&#36;")
              .replaceAll("\n", "&#10;")
              .replaceAll("\r", "&#13;") +
            '">',
        );
      }
      if (image.mediaId) tag = tag.replace(/\s+srcset=(['"])[^]*?\1/gi, "");
      return tag;
    });
    if (image.mediaId)
      source = source.replace(matcher, () => assetUrl(image.mediaId));
  }
  return source;
}
