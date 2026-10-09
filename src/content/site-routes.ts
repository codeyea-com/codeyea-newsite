import {industrySlugs,isIndustrySlug} from './industry-registry';
export const documentSlugs=['website-design','brand-design','ecommerce','seo-geo','digital-marketing','web-mobile-apps','ai-automation','technical-support','contact','domains','website-hosting','wordpress-hosting','cloud-hosting','email-hosting'] as const;
export function pagePath(id:string){if(id==='homepage')return '/';if(['about','services','industries'].includes(id))return `/${id}/`;if(isIndustrySlug(id))return `/industries/${id}/`;return null}
export function publishedPagePaths(pages:{id:string;publishedAt:Date|null;publishedSnapshot:unknown;deletedAt?:Date|null}[]){return pages.flatMap(page=>{if(page.deletedAt||!page.publishedAt||!page.publishedSnapshot)return [];const path=pagePath(page.id);return path?[path]:[]})}
export function documentPath(slug:string,locale='en'){if(!(documentSlugs as readonly string[]).includes(slug)||!['en','ar'].includes(locale))return null;return `${locale==='ar'?'/ar':''}/${slug}/`}
export const existingPageIds=['homepage','about','services','industries',...industrySlugs];
