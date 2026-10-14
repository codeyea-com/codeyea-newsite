import fs from "node:fs/promises";
import path from "node:path";
import {
  conceptCaseStudies,
  type CaseLocale,
} from "../src/content/concept-case-studies";
import {
  renderConceptCaseStudy,
  renderConceptCaseIndex,
} from "../src/server/concept-case-study-render";
const root = "docs/section-imagery-preview/case-studies";
const origin = "http://127.0.0.1:3014";
const links = {
  index: (locale: CaseLocale) => `index-${locale}.html`,
  detail: (slug: string, locale: CaseLocale) => `${slug}-${locale}.html`,
};
await fs.mkdir(root, { recursive: true });
function local(html: string, counterpart: string, locale: CaseLocale) {
  return html
    .replace('<span class="cy-language-slot"></span>', `<span class="cy-language-slot"><a href="${counterpart}" lang="${locale==='ar'?'en':'ar'}">${locale==='ar'?'English':'العربية'}</a></span>`)
    .replace(/(src|href)="\/(?!\/)([^"]*)"/g, `$1="${origin}/$2"`)
    .replace(/url\(["']?\/(?!\/)([^)'"\s]+)["']?\)/g, `url(${origin}/$1)`)
    .replace(/[\t ]+$/gm, "");
}
for (const locale of ["en", "ar"] as const) {
  await fs.writeFile(
    path.join(root, `index-${locale}.html`),
    local(await renderConceptCaseIndex(locale, links),links.index(locale==='ar'?'en':'ar'),locale),
  );
  for (const item of conceptCaseStudies)
    await fs.writeFile(
      path.join(root, `${item.slug}-${locale}.html`),
      local(await renderConceptCaseStudy(item, locale, links),links.detail(item.slug,locale==='ar'?'en':'ar'),locale),
    );
}
console.log({ pages: 12, indexes: 2, root });
