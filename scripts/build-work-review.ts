import fs from "node:fs/promises";
import path from "node:path";
import { illustrativeWork } from "../src/content/illustrative-work";
import {
  renderDocument,
  templateContent,
  templatePageDraft,
} from "../src/server/site-documents";
import { arabicText } from "../src/content/arabic-localization";
const root = "docs/section-imagery-preview/application-concepts";
await fs.mkdir(root, { recursive: true });
await fs.cp("public/site/generated", path.join(root, "assets"), {
  recursive: true,
});
const links: string[] = [];
for (const slug of Object.keys(illustrativeWork)) {
  const source = await templateContent(slug),
    draft = templatePageDraft(slug, source);
  for (const locale of ["en", "ar"]) {
    const content = structuredClone(draft.content);
    if (locale === "ar")
      content.fields = content.fields.map((f) => {
        try {
          return { ...f, value: arabicText(f.value) };
        } catch {
          return f;
        }
      });
    let html = await renderDocument(slug, content, locale, draft.title, {
      public: true,
    });
    html = html.replaceAll("/site/generated/", "assets/");
    html = html
      .replace(
        /(src|href)="\/(?!\/)([^"]*)"/g,
        '$1="https://codeyea-newsite.vercel.app/$2"',
      )
      .replace(
        /url\(["']?\/(?!\/)([^)'"\s]+)["']?\)/g,
        "url(https://codeyea-newsite.vercel.app/$1)",
      );
    const file = slug + "-" + locale + ".html";
    await fs.writeFile(path.join(root, file), html);
    links.push(
      `<a href="${file}#ds-works">${slug} · ${locale === "ar" ? "العربية" : "English"}</a>`,
    );
  }
}
await fs.writeFile(
  path.join(root, "index.html"),
  `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>CODEYEA | النماذج التطبيقية</title><style>body{font:18px Arial;padding:40px;color:#18243a}nav{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}a{display:block;padding:22px;border:1px solid #dce3e9;color:#173859;text-decoration:none;border-radius:0}p{line-height:1.8}</style><h1>النماذج التطبيقية داخل الصفحات</h1><p>24 نموذجًا توضيحيًا، بالعربية والإنجليزية. نصف التكوينات تقني، والنصف الآخر مشاهد واقعية مع عناصر متداخلة.</p><nav>${links.join("")}</nav></html>`,
);
console.log("Eight bilingual review pages built");
