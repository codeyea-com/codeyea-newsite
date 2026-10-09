const approvedServiceDestinations:Readonly<Record<string,string>>={
 'sv-priority-ai':'/ai-automation/',
 'sv-priority-seo':'/seo-geo/',
 'sv-priority-development':'/web-mobile-apps/',
 'sv-priority-commerce':'/ecommerce/',
 'sv-service-ai':'/ai-automation/',
 'sv-service-seo':'/seo-geo/',
 'sv-service-app':'/web-mobile-apps/',
 'sv-service-commerce':'/ecommerce/',
 'sv-service-website':'/website-design/',
 'sv-service-marketing':'/digital-marketing/',
 'sv-service-brand':'/brand-design/',
};
export function servicePageDestination(id:string){return approvedServiceDestinations[id]}
const serviceTextRoutes:Array<[RegExp,string]>=[
 [/wordpress/, '/wordpress-hosting/'],
 [/email\s+hosting/, '/email-hosting/'],
 [/cloud\s+hosting/, '/cloud-hosting/'],
 [/technical\s+support|troubleshoot|maintenance\s+support/, '/technical-support/'],
 [/domain/, '/domains/'],
 [/e-?commerce|online\s+store|digital\s+commerce/, '/ecommerce/'],
 [/seo|geo|search\s+(?:visibility|optimization|growth)/, '/seo-geo/'],
 [/brand|creative|visual\s+identity/, '/brand-design/'],
 [/campaign|digital\s+market|marketing|digital\s+strategy/, '/digital-marketing/'],
 [/website\s+design|web\s+design/, '/website-design/'],
 [/web\s*(?:&|and|\/)\s*(?:app|mobile)|application\s+development|web\s+development/, '/web-mobile-apps/'],
 [/ai|automation|workflow/, '/ai-automation/'],
 [/hosting|server|migration/, '/website-hosting/'],
];
export function servicePageDestinationForText(id:string,title:string,actionLabel=''){
 const known=servicePageDestination(id);
 if(known)return known;
 const text=`${title} ${actionLabel}`.toLocaleLowerCase('en');
 return serviceTextRoutes.find(([pattern])=>pattern.test(text))?.[1];
}
export function industryPageDestination(title:string){
 const normalized=title.trim().toLocaleLowerCase('en').replace(/&/g,'and').replace(/\s+/g,' ');
 const aliases:Record<string,string>={'ecommerce':'e-commerce','healthcare and aesthetic clinics':'healthcare'};
 const alias=aliases[normalized];
 if(alias)return `/industries/${alias}/`;
 const slug=industrySlugs.find(id=>industryNames[id].toLocaleLowerCase('en').replace(/&/g,'and').replace(/\s+/g,' ')===normalized);
 return slug?`/industries/${slug}/`:undefined;
}
import {industryNames,industrySlugs} from './industry-registry';
