import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from 'node:crypto';
import {AppError} from './errors';
import {documentStructuredSchema,jsonLdText} from '@/content/structured-data';
import {documentPath} from '@/content/site-routes';

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
export type DocumentContent = {
  templateHash?: string;
  fields: Field[];
  description: string;
  body?: string;
  image?: string;
  category?: string;
  tags?: string[];
};
export function templateHash(html:string){return createHash('sha256').update(html.match(/<main\b[\s\S]*?<\/main>/)?.[0]??html).digest('hex')}
export function bindTemplate(html:string,content:DocumentContent):DocumentContent{
 const hash=templateHash(html);
 if(content.templateHash&&content.templateHash!==hash)throw new AppError(409,'The approved template changed. Review its content mapping before editing or previewing.');
 const expected=extractFields(html);
 if(expected.length!==content.fields.length||expected.some((f,i)=>f.key!==content.fields[i].key||(!content.templateHash&&f.label!==content.fields[i].label)))throw new AppError(409,'This draft does not match the approved template. Review the content mapping first.');
 return {...content,templateHash:hash};
}
export async function templateContent(slug: string) {
  if (!approvedTemplates[slug]) throw Error("Unknown template");
  return fs.readFile(
    path.join(process.cwd(), "docs", approvedTemplates[slug]),
    "utf8",
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
export async function renderDocument(
  slug: string,
  content: DocumentContent,
  locale: string,
  title?: string,
) {
  let html = await templateContent(slug);
  content=bindTemplate(html,content);
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
  html = html.replace(
    /<html([^>]*)lang="[^"]*"([^>]*)>/,
    '<html$1lang="' +
      locale +
      '" dir="' +
      (locale === "ar" ? "rtl" : "ltr") +
      '"$2>',
  );
  // Keep approved templates server-side. Only allowlisted assets are exposed through the private asset route.
  html = html.replaceAll(
    "https://codeyea.com/contact/",
    "/preview/pages/contact",
  );
  html = html.replaceAll("/preview#services", "/preview/services");
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
  html = html.replace(
    /href="\/preview#industry-list"([^>]*)>([^<]+)<\/a>/g,
    (all, attributes, label) =>
      industries[label.trim()]
        ? 'href="/preview/industries/' +
          industries[label.trim()] +
          '"' +
          attributes +
          ">" +
          label +
          "</a>"
        : all,
  );
  html = html
    .replaceAll("../../public/", "/")
    .replaceAll("http://127.0.0.1:3002/", "/");
  for (const [id, file] of Object.entries(approvedTemplates))
    html = html.replaceAll("../" + file, "/preview/pages/" + id);
  html = html.replace(
    /(?:src|href)="(\.\.\/[^"?#]+)([?#][^"]*)?"/g,
    (m, relative, suffix = "") => {
      const resolved = path.posix.normalize(
        path.posix.join(path.posix.dirname(approvedTemplates[slug]), relative),
      );
      return m.replace(
        relative + suffix,
        "/api/site-assets/" + resolved + suffix,
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
  if (title)
    html = html.replace(
      /<title>[^]*?<\/title>/,
      "<title>" + escapeHtml(title) + " | CODEYEA</title>",
    );
  const pageTitle=title?title+' | CODEYEA':slugTitle(slug)+' | CODEYEA';
  html = replaceNamedMeta(html,'robots','<meta name="robots" content="noindex,nofollow">');
  html = replaceNamedMeta(html,'description','<meta name="description" content="'+escapeHtml(content.description)+'">');
  html=replacePropertyMeta(html,'og:title','<meta property="og:title" content="'+escapeHtml(pageTitle)+'">');
  html=replacePropertyMeta(html,'og:description','<meta property="og:description" content="'+escapeHtml(content.description)+'">');
  html=replacePropertyMeta(html,'og:type','<meta property="og:type" content="website">');
  html=replacePropertyMeta(html,'og:site_name','<meta property="og:site_name" content="CODEYEA">');
  const publicPath=documentPath(slug,locale);
  if(publicPath)html=replacePropertyMeta(html,'og:url','<meta property="og:url" content="https://codeyea.com'+publicPath+'">');
  html=replaceNamedMeta(html,'twitter:card','<meta name="twitter:card" content="summary">');
  html=replaceNamedMeta(html,'twitter:title','<meta name="twitter:title" content="'+escapeHtml(pageTitle)+'">');
  html=replaceNamedMeta(html,'twitter:description','<meta name="twitter:description" content="'+escapeHtml(content.description)+'">');
  const schema=documentStructuredSchema(slug,pageTitle,content.description,locale);
  if(schema){
   const script='<script type="application/ld+json">'+jsonLdText(schema)+'</script>';
   const existing=/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/i;
   html=existing.test(html)?html.replace(existing,script):html.replace('</head>',script+'</head>');
  }
  // The new quote panel owns submission on integrated previews; old local-preview handlers are intercepted.
  html = html.replace(
    "</head>",
    "<script>window.CODEYEA_LEADS_ENABLED=true</script></head>",
  );
  html = html.replace(
    "</body>",
    '<script src="/site/lead-forms.js"></script></body>',
  );
  html=html.replaceAll('/brand/logo-dark.png','/brand/logo-animated-dark.svg').replaceAll('/brand/logo-light.png','/brand/logo-animated-light.svg');
  html=html.replace(/<img\b[^>]*class="[^"]*hp-logo-light[^"]*"[^>]*>/g,tag=>tag.replace('/brand/logo-animated-light.svg','/brand/logo-animated-dark.svg'));
  return html;
}
function slugTitle(slug:string){return slug.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')}
export function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
function replaceNamedMeta(html:string,name:string,tag:string){
 const existing=new RegExp('<meta\\b(?=[^>]*\\bname=["\\\']'+name+'["\\\'])[^>]*>','i');
 return existing.test(html)?html.replace(existing,tag):html.replace('</head>',tag+'</head>');
}
function replacePropertyMeta(html:string,property:string,tag:string){
 const existing=new RegExp('<meta\\b(?=[^>]*\\bproperty=["\\\']'+property+'["\\\'])[^>]*>','i');
 return existing.test(html)?html.replace(existing,tag):html.replace('</head>',tag+'</head>');
}
