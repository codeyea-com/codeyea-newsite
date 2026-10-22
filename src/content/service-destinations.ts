import {industryNames,industrySlugs} from './industry-registry';
import {serviceCatalog} from './service-catalog';
import {canonicalSiteHref} from './url-hierarchy';
const homepageServiceDestinations:Readonly<Record<string,string>>={
 'service-1':'/services/web-mobile-apps/','service-2':'/services/ecommerce/','service-3':'/services/ai-automation/','service-4':'/website-hosting/',
 'service-5':'/services/seo-geo-aeo/','service-6':'/services/brand-design/','service-7':'/services/technical-support/','service-8':'/services/',
};
export function homepageServiceDestination(id:string){return homepageServiceDestinations[id]}
const approvedServiceDestinations:Readonly<Record<string,string>>={
 'sv-priority-ai':'/services/ai-automation/',
 'sv-priority-seo':'/services/seo-geo-aeo/',
 'sv-priority-development':'/services/web-mobile-apps/',
 'sv-priority-commerce':'/services/ecommerce/',
 'sv-service-ai':'/services/ai-automation/',
 'sv-service-seo':'/services/seo-geo-aeo/',
 'sv-service-app':'/services/web-mobile-apps/',
 'sv-service-commerce':'/services/ecommerce/',
 'sv-service-website':'/services/website-design/',
 'sv-service-marketing':'/services/digital-marketing/',
 'sv-service-brand':'/services/brand-design/',
 'sv-service-graphic':'/services/brand-design/',
};
export function servicePageDestination(id:string){const service=serviceCatalog.find(item=>item.id===id);return service?canonicalSiteHref(`/services/${service.slug}/`):approvedServiceDestinations[id]}
const serviceTextRoutes:Array<[RegExp,string]>=[
 [/wordpress/, '/wordpress-hosting/'],
 [/email\s+hosting/, '/email-hosting/'],
 [/cloud\s+hosting/, '/cloud-hosting/'],
 [/technical\s+support|troubleshoot|maintenance\s+support/, '/services/technical-support/'],
 [/domain/, '/domains/'],
 [/e-?commerce|online\s+store|digital\s+commerce/, '/services/ecommerce/'],
 [/seo|geo|search\s+(?:visibility|optimization|growth)/, '/services/seo-geo-aeo/'],
 [/brand|creative|visual\s+identity/, '/services/brand-design/'],
 [/campaign|digital\s+market|marketing|digital\s+strategy/, '/services/digital-marketing/'],
 [/website\s+design|web\s+design/, '/services/website-design/'],
 [/web\s*(?:&|and|\/)\s*(?:app|mobile)|application\s+development|web\s+development/, '/services/web-mobile-apps/'],
 [/ai|automation|workflow/, '/services/ai-automation/'],
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
