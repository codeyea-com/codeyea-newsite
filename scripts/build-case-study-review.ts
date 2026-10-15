import fs from "node:fs/promises";
import path from "node:path";
import {
  conceptCaseStudies,
  type CaseLocale,
} from "../src/content/concept-case-studies";
import {
  renderConceptCaseStudy,
  renderConceptCaseIndex,
  renderIraqHomeExpo,
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
    .replace(/<span class="cy-language-slot( cy-language-mobile)?"><\/span>/g,(_match,mobile='')=>`<span class="cy-language-slot${mobile}"><a href="${counterpart}" lang="${locale==='ar'?'en':'ar'}">${locale==='ar'?'English':'العربية'}</a></span>`)
    .replace(/(src|href)="\/(?!\/)([^"]*)"/g, `$1="${origin}/$2"`)
    .replace(/url\(["']?\/(?!\/)([^)'"\s]+)["']?\)/g, `url(${origin}/$1)`)
    .replace(/[\t ]+$/gm, "");
}
for (const locale of ["en", "ar"] as const) {
  if (!process.argv.includes('--details-only')) await fs.writeFile(
    path.join(root, `index-${locale}.html`),
    local(await renderConceptCaseIndex(locale, links),links.index(locale==='ar'?'en':'ar'),locale),
  );
  for (const item of conceptCaseStudies)
    await fs.writeFile(
      path.join(root, `${item.slug}-${locale}.html`),
      local(await renderConceptCaseStudy(item, locale, links),links.detail(item.slug,locale==='ar'?'en':'ar'),locale),
    );
  await fs.writeFile(
    path.join(root, `iraq-home-expo-${locale}.html`),
    local(await renderIraqHomeExpo(locale, links),links.detail('iraq-home-expo',locale==='ar'?'en':'ar'),locale),
  );
  const adopted = (await fs.readFile(path.join(root, `iraq-home-expo-${locale}.html`),'utf8'))
    .replace(/href="((?:index|iraq-home-expo|velora-skin-clinic|madar-solar|tradebridge-expo|atlas-supply|safa-clinics|mada-developments)-(?:ar|en)\.html)"/g,'href="../case-studies/$1"');
  await fs.writeFile(path.join(root,'../case-study-reference-v2',locale==='ar'?'index.html':'index-en.html'),adopted);
}
const options=conceptCaseStudies.map(c=>`<option value="${c.slug}">${c.ar.name}</option>`).join('');
await fs.writeFile(path.join(root,'detail-review.html'),`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>مراجعة صفحات الكيس ستادي المعتمدة</title><style>*{box-sizing:border-box;border-radius:0}body{margin:0;background:#eee;font:14px/1.7 Arial;color:#191b30}header{padding:16px;background:#fff;display:flex;gap:14px;flex-wrap:wrap;align-items:center}select,a{padding:10px;border:1px solid #ccc;background:#fff;color:inherit}iframe{display:block;border:0;height:calc(100vh - 88px);width:100%;background:#fff}main{max-width:100%;margin:10px auto}a{background:#e0144c;color:#fff;text-decoration:none}</style></head><body><header><strong>الصفحات الفرعية المعتمدة</strong><select id="project" aria-label="المشروع"><option value="iraq-home-expo">Iraq Home Expo</option>${options}</select><select id="lang" aria-label="اللغة"><option value="ar">العربية</option><option value="en">English</option></select><select id="size" aria-label="حجم المعاينة"><option value="1280">ديسكتوب</option><option value="820">تابلت</option><option value="390">موبايل</option></select><a id="open" href="iraq-home-expo-ar.html" target="_blank">افتح الصفحة</a></header><main style="width:1280px"><iframe title="معاينة صفحة الكيس ستادي" src="iraq-home-expo-ar.html"></iframe></main><script>const p=document.querySelector('#project'),l=document.querySelector('#lang'),s=document.querySelector('#size'),f=document.querySelector('iframe');const q=new URLSearchParams(location.search);if([...p.options].some(o=>o.value===q.get('project')))p.value=q.get('project');if(q.get('lang')==='en')l.value='en';if(['390','820','1280'].includes(q.get('width')))s.value=q.get('width');function show(){const url=p.value+'-'+l.value+'.html';f.src=url;document.querySelector('#open').href=url;document.querySelector('main').style.width=s.value+'px';}p.onchange=l.onchange=show;s.onchange=()=>document.querySelector('main').style.width=s.value+'px';show();</script></body></html>`);
console.log({ pages: 14, indexes: process.argv.includes('--details-only') ? 'unchanged' : 2, root });
