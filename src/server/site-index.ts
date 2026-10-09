import {snapshotSchema} from '@/schemas/content';
import {pagePath} from '@/content/site-routes';
import {documentPath} from '@/content/site-routes';
type PageRecord={id:string;publishedSnapshot:unknown;publishedAt:Date|null;deletedAt?:Date|null};
export function publishedSitemap(pages:PageRecord[],origin='https://codeyea.com'){
 return pages.flatMap(page=>{if(page.deletedAt||!page.publishedAt||!page.publishedSnapshot)return [];const pathname=pagePath(page.id),parsed=snapshotSchema.safeParse(page.publishedSnapshot);if(!pathname||!parsed.success)return [];const data=parsed.data;
 const hasPage=page.id==='homepage'?!!data.homepage||data.sections.length===1:page.id==='about'?!!data.about:page.id==='services'?!!data.servicesPage:page.id==='industries'?!!data.industriesPage:!!data.industryDetail&&data.industryDetail.slug===page.id;
 return hasPage?[{url:new URL(pathname,origin).href,lastModified:page.publishedAt}]:[];
 });
}
type DocumentRecord={slug:string;locale:string;published:unknown;updatedAt:Date};
export function publishedDocumentSitemap(documents:DocumentRecord[],origin='https://codeyea.com'){
 return documents.flatMap(document=>{
  if(!document.published||!(document.updatedAt instanceof Date)||Number.isNaN(document.updatedAt.getTime()))return [];
  const path=documentPath(document.slug,document.locale);
  const publication=document.published as {content?:{seo?:{index?:boolean}}};
  if(!path||publication.content?.seo?.index===false)return [];
  return [{url:new URL(path,origin).href,lastModified:document.updatedAt}];
 });
}
