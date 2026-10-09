import type {IndustryDetailContent} from '@/schemas/industry-detail';

/** Bind the corrected identities to existing editorial fields, without a second CMS contract. */
export function industryIdentitySeo(detail:IndustryDetailContent){
 if(detail.slug!=='e-commerce'&&detail.slug!=='oil-and-gas')return undefined;
 const name=detail.hero.title,title=detail.seo?.title??`Digital Services for ${name} | CODEYEA`;
 const description=detail.seo?.description??`Digital services for ${name} businesses.`;
 const url=`https://codeyea.com/industries/${detail.slug}/`;
 return {title,description,openGraph:{title,description,url,type:'website' as const},structuredData:{'@context':'https://schema.org','@type':'WebPage',name,description,url}};
}
