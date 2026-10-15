/** Render the approved artwork before the browser receives the document.
 * The existing scripts remain the single source of artwork and CMS text keys.
 * Read only their literal markup, never execute JavaScript or CMS content here.
 */
const heroes: Record<
  string,
  {
    hero: string;
    scene: string;
    variable: string;
    mode?: "replace" | "prepend" | "media";
  }
> = {
  "website-design": {
    hero: "hero-concept",
    scene: "hero-art",
    variable: "template",
    mode: "replace",
  },
  "brand-design": {
    hero: "brand-concept",
    scene: "brand-stage",
    variable: "s",
  },
  ecommerce: { hero: "ecom-concept", scene: "ecom-stage", variable: "stage" },
  "seo-geo": {
    hero: "seo-live-hero",
    scene: "seo-scene",
    variable: "media",
    mode: "media",
  },
  "digital-marketing": {
    hero: "digital-live-hero",
    scene: "campaign-scene",
    variable: "scene",
  },
  "web-mobile-apps": {
    hero: "web-mobile-journey",
    scene: "app-journey",
    variable: "s",
  },
  "ai-automation": {
    hero: "automation-live-hero",
    scene: "automation-scene",
    variable: "scene",
  },
  "technical-support": {
    hero: "support-live-hero",
    scene: "support-scene",
    variable: "scene",
  },
  "website-hosting": {
    hero: "hosting-live-hero",
    scene: "hosting-scene",
    variable: "scene",
  },
  "wordpress-hosting": {
    hero: "wp-live-hero",
    scene: "wp-scene",
    variable: "scene",
  },
  "cloud-hosting": {
    hero: "cloud-live-hero",
    scene: "cloud-scene",
    variable: "scene",
  },
  "email-hosting": {
    hero: "mail-live-hero",
    scene: "mail-scene",
    variable: "scene",
  },
  domains: {
    hero: "",
    scene: "domain-cosmos",
    variable: "cosmos",
    mode: "prepend",
  },
};

function literal(
  source: string,
  start: number,
): { value: string; end: number } {
  const quote = source[start];
  if (!['"', "'", "`"].includes(quote))
    throw Error("Expected literal hero markup");
  let value = "";
  for (let i = start + 1; i < source.length; i++) {
    const char = source[i];
    if (char === quote) return { value, end: i + 1 };
    if (char === "\\") {
      const escaped = source[++i];
      value +=
        ({ n: "\n", r: "\r", t: "\t" } as Record<string, string>)[escaped] ??
        escaped;
    } else value += char;
  }
  throw Error("Unterminated hero markup");
}

function markup(source: string, variable: string): string {
  const assignment = new RegExp(`\\b${variable}\\.innerHTML\\s*=\\s*`).exec(
    source,
  );
  if (!assignment) throw Error(`Missing ${variable} hero markup`);
  let cursor = assignment.index + assignment[0].length;
  let value: string;
  if (source[cursor] === "[") {
    const parts: string[] = [];
    cursor++;
    while (cursor < source.length) {
      while (/[\s,]/.test(source[cursor])) cursor++;
      if (source[cursor] === "]") break;
      const part = literal(source, cursor);
      parts.push(part.value);
      cursor = part.end;
    }
    value = parts.join("");
  } else value = literal(source, cursor).value;
  return value.replace(/\$\{([^}]+)\}/g, (_all, name: string) => {
    // The commerce artwork references three fixed strings. Reject expressions.
    if (!/^(bag|dress|headphone)$/.test(name))
      throw Error("Unsupported hero expression");
    const declaration = new RegExp(`\\bconst ${name}\\s*=\\s*`).exec(source);
    if (!declaration) throw Error(`Missing hero literal ${name}`);
    return literal(source, declaration.index + declaration[0].length).value;
  });
}

type ElementRange = {
  start: number;
  end: number;
  openEnd: number;
  closeStart: number;
  html: string;
};
function element(
  html: string,
  className: string,
  tag = "[a-z][\\w:-]*",
): ElementRange | undefined {
  const open = new RegExp(
    `<(${tag})\\b(?=[^>]*\\bclass="[^"]*\\b${className}\\b[^"]*")[^>]*>`,
    "i",
  ).exec(html);
  if (!open) return;
  const tokens = new RegExp(`<\\/?${open[1]}\\b[^>]*>`, "gi");
  tokens.lastIndex = open.index;
  let depth = 0,
    token;
  while ((token = tokens.exec(html))) {
    depth += token[0].startsWith("</") ? -1 : token[0].endsWith("/>") ? 0 : 1;
    if (!depth)
      return {
        start: open.index,
        openEnd: open.index + open[0].length,
        closeStart: token.index,
        end: tokens.lastIndex,
        html: html.slice(open.index, tokens.lastIndex),
      };
  }
  throw Error(`Unclosed hero element ${className}`);
}
function replaceElement(
  html: string,
  range: ElementRange,
  replacement: string,
) {
  return html.slice(0, range.start) + replacement + html.slice(range.end);
}
export function renderIntegratedHero(
  html: string,
  slug: string,
  source: string,
): string {
  const config = heroes[slug];
  if (!config) throw Error(`Unregistered interactive hero ${slug}`);
  const old = element(
    html,
    slug === "domains"
      ? "d-hero"
      : ["website-design", "brand-design", "ecommerce"].includes(slug)
        ? "b-hero"
        : "about-hero",
    "section",
  );
  if (!old) return html;
  let art = markup(source, config.variable);
  if (slug === "web-mobile-apps")
    art =
      `<div class="desktop-store" aria-label="Desktop restaurant ordering website preview">${markup(source, "web")}</div>` +
      art;
  if (!config.mode || config.mode === "prepend") {
    const attributes = [
      ...source.matchAll(
        new RegExp(
          `${config.variable}\\.setAttribute\\(['"]([^'"]+)['"],\\s*(['"])(.*?)\\2\\)`,
          "g",
        ),
      ),
    ]
      .filter((match) =>
        ["role", "aria-label", "aria-hidden"].includes(match[1]),
      )
      .map((match) => ` ${match[1]}="${match[3].replaceAll('"', "&quot;")}"`)
      .join("");
    art = `<div class="${config.scene}"${attributes}>${art}</div>`;
  }
  let hero = old.html;
  if (config.mode === "replace") {
    // Keep edited/localized title, service name, CTA and hidden-section state.
    for (const className of [
      "b-hero-number",
      "w-service-name",
      "hero-side-note",
      "b-btn",
    ]) {
      const original = element(hero, className),
        target = element(art, className);
      if (!original || !target) continue;
      const replacement =
        className === "b-hero-number"
          ? original.html.replace(
              /<\/span>$/,
              '<span class="hero-brand-mark" aria-hidden="true">✳</span></span>',
            )
          : original.html;
      art = replaceElement(art, target, replacement);
    }
    const title = hero.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
    if (title !== undefined)
      art = art.replace(
        /(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/,
        (_all, open, close) => open + title + close,
      );
    const state =
      hero
        .slice(0, hero.indexOf(">") + 1)
        .match(/\sdata-cms-[\w-]+="[^"]*"/g)
        ?.join("") ?? "";
    hero = art.replace("<section ", `<section${state} `);
    hero = hero.replaceAll(
      "./assets/",
      "/api/site-assets/website-design-review/assets/",
    );
  } else {
    if (config.hero)
      hero = hero.replace(
        /(<section\b[^>]*\bclass=")([^"]*)/,
        `$1$2 ${config.hero}`,
      );
    // Retired photography is removed, so the browser never downloads or paints it.
    for (const className of ["b-hero-images", "b-hero-shade"]) {
      const legacy = element(hero, className);
      if (legacy) hero = replaceElement(hero, legacy, "");
    }
    if (config.mode === "prepend")
      hero = hero.replace(/(<section\b[^>]*>)/, "$1" + art);
    else if (slug === "brand-design" || slug === "ecommerce") {
      const content = element(hero, "b-hero-content");
      if (!content) throw Error(`Missing hero copy for ${slug}`);
      hero = hero.slice(0, content.start) + art + hero.slice(content.start);
    } else {
      const media = element(hero, "internal-hero-media");
      if (!media) throw Error(`Missing hero frame for ${slug}`);
      // SEO is built on DOMContentLoaded in the approved script and has no
      // shared-layout wrapper. Keep that frame's existing dimensions unchanged.
      const frame =
        slug === "seo-geo" ? art : `<div class="hero-art-box">${art}</div>`;
      hero =
        hero.slice(0, media.openEnd) + frame + hero.slice(media.closeStart);
    }
  }
  hero = hero.replace(/(<section\b[^>]*)(>)/, '$1 data-hero-rendered="true"$2');
  return replaceElement(html, old, hero);
}
