import {db} from '@/server/db';
import {snapshotSchema} from '@/schemas/content';
import {ServicesPage} from '@/components/sections/services-page';
import {PublicTracking} from '@/components/cms/public-tracking';
import type {Metadata} from 'next';
import {publicRobots,resolveSeoText} from '@/content/seo';
import {pageMetadata,publicPageSchema} from '@/content/structured-data';
import {JsonLd} from '@/components/json-ld';
import {publishedSitePaths} from '@/content/site-routes';
import approvedFallback from '@/content/approved-services-fallback.json';
import {servicesPageSchema} from '@/schemas/services-page';
import {defaultHomepage} from '@/content/homepage-defaults';
import '@/styles/homepage.css';import '@/styles/homepage-interactions.css';import '@/styles/homepage-motion.css';import '@/styles/homepage-refinements.css';import '@/styles/homepage-mobile.css';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{
 const page=await db.page.findFirst({where:{id:'services',deletedAt:null},select:{publishedSnapshot:true}});
 const parsed=page?.publishedSnapshot?snapshotSchema.safeParse(page.publishedSnapshot):undefined;
 const saved=parsed?.success?parsed.data.servicesPage?.seo:undefined;
 const seo=resolveSeoText(saved,{title:'Website, SEO, Branding & AI Services | CODEYEA',description:'Explore CODEYEA services for website design, e-commerce, SEO and GEO, branding, digital marketing, apps, AI automation and technical support.'});
 return {...pageMetadata('/services/',seo.title,seo.description,seo),robots:publicRobots(true,seo)};
}
export default async function Services(){
 const page=await db.page.findFirst({where:{id:'services',deletedAt:null},select:{publishedSnapshot:true}});
 const content=page?.publishedSnapshot?snapshotSchema.parse(page.publishedSnapshot).servicesPage:undefined;
 const shared=await db.page.findUnique({where:{id:'homepage'},select:{publishedSnapshot:true}});
 const [published,documents]=await Promise.all([db.page.findMany({where:{deletedAt:null,publishedAt:{not:null}},select:{id:true,publishedSnapshot:true,publishedAt:true,deletedAt:true}}),db.siteDocument.findMany({where:{kind:'page'},select:{slug:true,locale:true,published:true,kind:true}})]);
 // The owner-approved Services draft was saved but intentionally never published in the CMS.
 // Keep its exact reviewed content as the public fallback until a published CMS snapshot supersedes it.
 const pageContent=content??servicesPageSchema.parse(approvedFallback.servicesPage);
 const seo=resolveSeoText(pageContent.seo,{title:'Website, SEO, Branding & AI Services | CODEYEA',description:'Explore CODEYEA services for website design, e-commerce, SEO and GEO, branding, digital marketing, apps, AI automation and technical support.'});
 return <><JsonLd data={publicPageSchema('/services/',seo.title,seo.description,'CollectionPage')}/><ServicesPage content={pageContent} shared={shared?.publishedSnapshot?snapshotSchema.parse(shared.publishedSnapshot).homepage:defaultHomepage()} availablePaths={publishedSitePaths({pages:published,documents})}/><PublicTracking /></>;
}
