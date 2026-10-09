import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from 'node:crypto';
import {AppError} from './errors';
import {documentStructuredSchema,jsonLdText} from '@/content/structured-data';
import {documentPath} from '@/content/site-routes';
import {seoTextSchema} from '@/schemas/seo-text';
import {siteOrigin} from '@/content/seo';
import {assetUrl} from '@/content/homepage-assets';
import {isIndustrySlug} from '@/content/industry-registry';

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
export type TemplateImage = { key: string; mediaId: string; alt: string; decorative: boolean };
export type DocumentContent = {
  templateHash?: string;
  fields: Field[];
  description: string;
  seo?: import('@/schemas/seo-text').SeoText;
  body?: string;
  image?: string;
  images?: TemplateImage[];
  category?: string;
  tags?: string[];
};
/** Assets for these templates are intentionally public: public routes render the approved
 * templates even before a CMS publication record exists. Keep the path allowlist narrow. */
export function isPublicTemplateAsset(relative: string) {
  if (relative.startsWith("shared-navigation/")) return true;
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
    const destination = surface === "public"
      ? documentPath(slug, locale) ?? "/services/"
      : "/preview/pages/" + slug + (locale === "ar" ? "?locale=ar" : "");
    text = text.replaceAll("../" + template, destination);
  }
  if (surface === "public") {
    text = text
      .replaceAll("/preview/services", documentPath("services", locale) ?? "/services/")
      .replaceAll("/preview/industries", documentPath("industries", locale) ?? "/industries/")
      .replaceAll("/preview/about", documentPath("about", locale) ?? "/about/")
      .replaceAll("/preview#services", documentPath("services", locale) ?? "/services/");
  }
  const base = path.posix.dirname(relative);
  return text.replace(/(["'(])assets\//g, `$1/api/site-assets/${base}/assets/`);
}
export const templatePageTitles:Record<string,string>={
 'website-design':'Website Design','brand-design':'Brand Design',ecommerce:'eCommerce','seo-geo':'SEO & GEO',
 'digital-marketing':'Digital Marketing','web-mobile-apps':'Web & Mobile Apps','ai-automation':'AI & Automation',
 'technical-support':'Technical Support',contact:'Contact',domains:'Domains','website-hosting':'Website Hosting',
 'wordpress-hosting':'WordPress Hosting','cloud-hosting':'Cloud Hosting','email-hosting':'Email Hosting',
};
export function documentRobots(content: DocumentContent, isPublic: boolean) {
  const enabled = isPublic && process.env.SITE_INDEXING_ENABLED === 'true';
  const index = enabled && content.seo?.index !== false;
  const follow = enabled && content.seo?.follow !== false;
  return `${index ? 'index' : 'noindex'},${follow ? 'follow' : 'nofollow'}`;
}
export function templateHash(html:string){return createHash('sha256').update(html.match(/<main\b[\s\S]*?<\/main>/)?.[0]??html).digest('hex')}
export function bindTemplate(html:string,content:DocumentContent):DocumentContent{
 const hash=templateHash(html);
 if(content.templateHash&&content.templateHash!==hash)throw new AppError(409,'The approved template changed. Review its content mapping before editing or previewing.');
 const expected=extractFields(html);
 if(expected.length!==content.fields.length||expected.some((f,i)=>f.key!==content.fields[i].key||(!content.templateHash&&f.label!==content.fields[i].label)))throw new AppError(409,'This draft does not match the approved template. Review the content mapping first.');
 const expectedImages=extractImages(html);
 const images=content.images??expectedImages.map(image=>({key:image.key,mediaId:'',alt:image.alt,decorative:!image.alt.trim()}));
 if(images.length!==expectedImages.length||images.some((image,index)=>image.key!==expectedImages[index].key))throw new AppError(409,'The approved template image map changed. Review image mappings before editing.');
 return {...content,templateHash:hash,images};
}
export async function templateContent(slug: string) {
  if (!approvedTemplates[slug]) throw Error("Unknown template");
  return fs.readFile(
    path.join(process.cwd(), "site-templates", approvedTemplates[slug]),
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
export function extractImages(html:string){
 const main=html.match(/<main\b[\s\S]*?<\/main>/)?.[0]??'';
 const images:Omit<TemplateImage,'mediaId'|'decorative'>[]=[];
 for(const tag of main.matchAll(/<img\b[^>]*>/gi)){
  const alt=tag[0].match(/\balt=["']([^"']*)["']/i)?.[1]??'';
  images.push({key:'image-'+images.length,alt:alt.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'")});
 }
 return images;
}
export function templatePageDraft(slug:string,html:string){
 const title=templatePageTitles[slug];
 const description=html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]?.trim()||`Explore ${title||slugTitle(slug)} from CODEYEA.`;
 const path=documentPath(slug,'en');
 if(!title||!path)throw new AppError(400,'This template has no registered English page route.');
 const content=bindTemplate(html,{fields:extractFields(html),description,seo:{title:`${title} | CODEYEA`,description,canonicalPath:path,index:false,follow:true}});
 return {title,content};
}
/** Replace private design-review destinations with registered public site routes. */
export function rewritePublicDocumentLinks(html:string,locale:'en'|'ar'){
 const prefix=locale==='ar'?'/ar':'';
 const route=(target:string)=>target?`${prefix}/${target.replace(/^\/+|\/+$/g,'')}/`:(prefix||'/');
 html=html.replace(/href="\/preview#industry-list"([^>]*)>([^<]+)<\/a>/g,(all,attributes,label)=>{
  const industries:Record<string,string>={'Healthcare &amp; Aesthetic Clinics':'healthcare',Construction:'construction','Real Estate':'real-estate',eCommerce:'e-commerce',Legal:'legal','Oil &amp; Gas':'oil-and-gas',Roofing:'roofing','Small Business':'small-business'};
  const target=industries[label.trim()];
  return target?'href="'+route('industries/'+target)+'"'+attributes+'>'+label+'</a>':all;
 });
 html=html.replace(/href="\/preview\/industries\/([a-z0-9-]+)"/g,(_all,target:string)=>isIndustrySlug(target)?'href="'+route('industries/'+target)+'"':'href="'+route('industries')+'"');
 html=html.replace(/href="\/preview(?:\/pages)?\/([a-z0-9-]+)(?:\?locale=(?:en|ar))?"/g,(_all,target:string)=>{
  if(target==='about'||target==='services'||target==='industries')return 'href="'+route(target)+'"';
  if(target==='website-hosting')return 'href="'+route(target)+'"';
  return (documentPath(target,locale)&&approvedTemplates[target])?'href="'+route(target)+'"':'href="'+route('services')+'"';
 });
 html=html.replace(/href="\/preview#services"/g,'href="'+route('services')+'"');
 html=html.replace(/href="\/preview#service-(\d+)"/g,(_all,n:string)=>'href="'+prefix+'/#service-'+n+'"');
 html=html.replace(/href="\/preview#hosting"/g,'href="'+route('website-hosting')+'"');
 html=html.replace(/href="\/preview#work"/g,'href="'+route('about')+'#work"');
 html=html.replace(/href="\/preview(?:\/)?"/g,'href="'+route('')+'"');
 html=html.replace(/href="https:\/\/codeyea\.com\/contact\/"/g,'href="'+route('contact')+'"');
 html=html.replace(/<a\b[^>]*href=["']\/admin(?:[?#][^"']*)?["'][^>]*>[\s\S]*?<\/a>/gi,'');
 return html;
}
export function applyTemplateImageOverrides(html:string,images:TemplateImage[]=[]){
 let index=0;
 return html.replace(/<main\b[\s\S]*?<\/main>/,main=>main.replace(/<img\b[^>]*>/gi,tag=>{
  const override=images[index++];
  if(!override?.mediaId)return tag;
  let updated=tag.replace(/\bsrc=(['"])[^'"]*\1/i,'src="'+escapeHtml(assetUrl(override.mediaId))+'"').replace(/\s+srcset=(['"])[^'"]*\1/i,'');
  if(!/\bsrc=/i.test(updated))updated=updated.replace(/<img\b/i,'<img src="'+escapeHtml(assetUrl(override.mediaId))+'"');
  const alt=override.decorative?'':override.alt;
  if(/\balt=(['"])[^'"]*\1/i.test(updated))updated=updated.replace(/\balt=(['"])[^'"]*\1/i,'alt="'+escapeHtml(alt)+'"');
  else updated=updated.replace(/<img\b/i,'<img alt="'+escapeHtml(alt)+'"');
  return updated;
 }));
}
export async function renderDocument(
  slug: string,
  content: DocumentContent,
  locale: string,
  title?: string,
  options: { public?: boolean; alternates?: Partial<Record<'en'|'ar', string>> } = {},
) {
  let html = await templateContent(slug);
  const publicLocalePrefix = locale === 'ar' ? '/ar' : '';
  const publicRoute = (target: string) => options.public ? `${publicLocalePrefix}/${target.replace(/^\/+|\/+$/g, '')}/` : `/preview/pages/${target.replace(/^\/+|\/+$/g, '')}${locale === 'ar' ? '?locale=ar' : ''}`;
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
  if(options.public)html=rewritePublicDocumentLinks(html,locale as 'en'|'ar');
  html=applyTemplateImageOverrides(html,content.images);
  if(!options.public){
    html=html.replaceAll("/preview#services", "/preview/services");
    html=html.replace(/href="\/preview\/(?:pages\/)?([a-z0-9-]+)(?:\?locale=(?:en|ar))?"/g, (_all, target: string) => 'href="' + publicRoute(target) + '"');
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
  if(!options.public)html = html.replace(
    /href="\/preview#industry-list"([^>]*)>([^<]+)<\/a>/g,
    (all, attributes, label) => {
      const target = industries[label.trim()];
      if (!target) return all;
      const destination = options.public
        ? `${publicLocalePrefix}/industries/${target}/`
        : `/preview/industries/${target}`;
      return 'href="' + destination + '"' + attributes + '>' + label + '</a>';
    },
  );
  html = html
    .replaceAll("../../public/", "/")
    .replaceAll("http://127.0.0.1:3002/", "/");
  for (const [id, file] of Object.entries(approvedTemplates))
    html = html.replaceAll("../" + file, publicRoute(id));
  html = html.replace(
    /(?:src|href)="(\.\.\/[^"?#]+)([?#][^"]*)?"/g,
    (m, relative, suffix = "") => {
      const resolved = path.posix.normalize(
        path.posix.join(path.posix.dirname(approvedTemplates[slug]), relative),
      );
      const assetSurface = options.public && /\.(?:css|js)$/i.test(relative)
        ? (suffix ? "&" : "?") + "surface=public" + (locale === "ar" ? "&locale=ar" : "")
        : "";
      return m.replace(relative + suffix, "/api/site-assets/" + resolved + suffix + assetSurface);
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
  const pageTitle = content.seo?.title?.trim() || (title ? title + ' | CODEYEA' : slugTitle(slug) + ' | CODEYEA');
  const description = content.seo?.description?.trim() || content.description;
  const publicPath = documentPath(slug, locale);
  const robots = documentRobots(content, options.public === true);
  const seo = seoTextSchema.parse(content.seo ?? { title: pageTitle.replace(/ \| CODEYEA$/, ''), description });
  const canonicalUrl = new URL(publicPath || '/', siteOrigin).href;
  const socialTitle = seo.socialTitle?.trim() || pageTitle;
  const socialDescription = seo.socialDescription?.trim() || description;
  const socialImageUrl = seo.socialImage?.mediaId ? new URL(assetUrl(seo.socialImage.mediaId), siteOrigin).href : '';
  if (title)
    html = html.replace(
      /<title>[^]*?<\/title>/,
      "<title>" + escapeHtml(pageTitle) + "</title>",
    );
  html = replaceNamedMeta(html,'robots','<meta name="robots" content="'+robots+'">');
  html = replaceNamedMeta(html,'description','<meta name="description" content="'+escapeHtml(description)+'">');
  const canonicalTag='<link rel="canonical" href="'+escapeHtml(canonicalUrl)+'">';
  html=/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i.test(html)?html.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i,canonicalTag):html.replace('</head>',canonicalTag+'</head>');
  if (options.public && options.alternates) {
    const alternateTags = Object.entries(options.alternates).map(([language, url]) => '<link rel="alternate" hreflang="' + language + '" href="' + escapeHtml(url) + '">').join('');
    const defaultUrl = options.alternates.en ? '<link rel="alternate" hreflang="x-default" href="' + escapeHtml(options.alternates.en) + '">' : '';
    html = html.replace('</head>', alternateTags + defaultUrl + '</head>');
  }
  html=replacePropertyMeta(html,'og:title','<meta property="og:title" content="'+escapeHtml(socialTitle)+'">');
  html=replacePropertyMeta(html,'og:description','<meta property="og:description" content="'+escapeHtml(socialDescription)+'">');
  html=replacePropertyMeta(html,'og:type','<meta property="og:type" content="website">');
  html=replacePropertyMeta(html,'og:site_name','<meta property="og:site_name" content="CODEYEA">');
  if(publicPath)html=replacePropertyMeta(html,'og:url','<meta property="og:url" content="'+escapeHtml(canonicalUrl)+'">');
  if(socialImageUrl)html=replacePropertyMeta(html,'og:image','<meta property="og:image" content="'+escapeHtml(socialImageUrl)+'">');
  html=replaceNamedMeta(html,'twitter:card','<meta name="twitter:card" content="summary">');
  html=replaceNamedMeta(html,'twitter:title','<meta name="twitter:title" content="'+escapeHtml(pageTitle)+'">');
  html=replaceNamedMeta(html,'twitter:description','<meta name="twitter:description" content="'+escapeHtml(socialDescription)+'">');
  if(socialImageUrl)html=replaceNamedMeta(html,'twitter:card','<meta name="twitter:card" content="summary_large_image">');
  if(socialImageUrl)html=replaceNamedMeta(html,'twitter:image','<meta name="twitter:image" content="'+escapeHtml(socialImageUrl)+'">');
  html=replaceNamedMeta(html,'twitter:title','<meta name="twitter:title" content="'+escapeHtml(socialTitle)+'">');
  const schema=documentStructuredSchema(slug,pageTitle,description,locale);
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
