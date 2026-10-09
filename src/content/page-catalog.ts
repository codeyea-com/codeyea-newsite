import {existingPageIds,pagePath,documentPath,documentSlugs} from './site-routes';
import {industryNames,isIndustrySlug} from './industry-registry';

type PageRow={id:string;title:string;publishedAt:Date|null;publishedSnapshot?:unknown;updatedAt:Date};
type DocumentRow={id:string;slug:string;title:string;locale:string;kind?:string;published:unknown;updatedAt:Date};
export type PageCatalogItem={
 id:string;source:'page'|'document';title:string;locale:string;path:string|null;
 preview:string|null;editor:string;status:'Published'|'Draft'|'Missing CMS record'|'Route mapping needed';updatedAt:string|null;
};
const labels:Record<string,string>={homepage:'Homepage',about:'About',services:'Services',industries:'Industries'};
function titleForPage(id:string,title?:string){return title?.trim()|| (isIndustrySlug(id)?industryNames[id]:labels[id]??id)}
function isDate(value:unknown):value is Date{return value instanceof Date&&!Number.isNaN(value.getTime())}

/** Builds the authenticated CMS catalog from the public route registry and stored documents. */
export function buildPageCatalog(input:{pages:PageRow[];documents:DocumentRow[]}):PageCatalogItem[]{
 const pagesById=new Map(input.pages.filter(p=>(existingPageIds as readonly string[]).includes(p.id)).map(p=>[p.id,p]));
 const items:PageCatalogItem[]=existingPageIds.flatMap(id=>{
  const page=pagesById.get(id), path=pagePath(id);
  if(!path) return [];
  return [{id,source:'page' as const,title:titleForPage(id,page?.title),locale:'en',path,
   preview:page? (id==='homepage'?'/preview':'/preview'+path):null,
   editor:'/admin/editor?page='+encodeURIComponent(id),
   status:!page?'Missing CMS record':page.publishedAt&&page.publishedSnapshot?'Published':'Draft',
   updatedAt:isDate(page?.updatedAt)?page.updatedAt.toISOString():null}];
 });
 for(const doc of input.documents){
  if(doc.kind&&doc.kind!=='page')continue;
  if(!['en','ar'].includes(doc.locale))continue;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(doc.slug))continue;
  const path=(documentSlugs as readonly string[]).includes(doc.slug)?documentPath(doc.slug,doc.locale):null;
  items.push({id:doc.id,source:'document',title:doc.title,locale:doc.locale,path,
   preview:path?`/preview/pages/${encodeURIComponent(doc.slug)}?locale=${encodeURIComponent(doc.locale)}`:null,
   editor:'/admin?section=Pages&document='+encodeURIComponent(doc.id),
   status:!path?'Route mapping needed':doc.published?'Published':'Draft',
   updatedAt:isDate(doc.updatedAt)?doc.updatedAt.toISOString():null});
 }
 const known=new Set(input.documents.filter(d=>!d.kind||d.kind==='page').map(d=>`${d.slug}:${d.locale}`));
 const titles:Record<string,string>={'website-design':'Website Design','brand-design':'Brand Design',ecommerce:'eCommerce','seo-geo':'SEO & GEO','digital-marketing':'Digital Marketing','web-mobile-apps':'Web & Mobile Apps','ai-automation':'AI & Automation','technical-support':'Technical Support',contact:'Contact',domains:'Domains','website-hosting':'Website Hosting','wordpress-hosting':'WordPress Hosting','cloud-hosting':'Cloud Hosting','email-hosting':'Email Hosting'};
 for(const slug of documentSlugs)for(const locale of ['en','ar'] as const){
  if(known.has(`${slug}:${locale}`))continue;
  items.push({id:`template:${slug}:${locale}`,source:'document',title:locale==='ar'?`${titles[slug]} · Arabic`:(titles[slug]??slug),locale,path:documentPath(slug,locale),preview:null,editor:'/admin?section=Pages',status:'Missing CMS record',updatedAt:null});
 }
 return items;
}
