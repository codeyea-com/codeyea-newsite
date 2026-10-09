import {notFound} from 'next/navigation';
import {db} from '@/server/db';
import {snapshotSchema} from '@/schemas/content';
import {ServicesPage} from '@/components/sections/services-page';
import {PublicTracking} from '@/components/cms/public-tracking';
import type {Metadata} from 'next';
import {publicRobots,resolveSeoText} from '@/content/seo';
import {pageMetadata,publicPageSchema} from '@/content/structured-data';
import {JsonLd} from '@/components/json-ld';
import {publishedPagePaths} from '@/content/site-routes';
import '@/styles/homepage.css';import '@/styles/homepage-interactions.css';import '@/styles/homepage-motion.css';import '@/styles/homepage-refinements.css';import '@/styles/homepage-mobile.css';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{
 const page=await db.page.findFirst({where:{id:'services',deletedAt:null},select:{publishedSnapshot:true}});
 const published=Boolean(page?.publishedSnapshot);
 const parsed=page?.publishedSnapshot?snapshotSchema.safeParse(page.publishedSnapshot):undefined;
 const saved=parsed?.success?parsed.data.servicesPage?.seo:undefined;
 const {title,description}=resolveSeoText(saved,{title:'Website, SEO, Branding & AI Services | CODEYEA',description:'Explore CODEYEA services for website design, e-commerce, SEO and GEO, branding, digital marketing, apps, AI automation and technical support.'});
 return {...pageMetadata('/services/',title,description),robots:publicRobots(published)};
}
export default async function Services(){
 const page=await db.page.findFirst({where:{id:'services',deletedAt:null},select:{publishedSnapshot:true}});
 if(!page?.publishedSnapshot)notFound();const content=snapshotSchema.parse(page.publishedSnapshot).servicesPage;if(!content)notFound();
 const shared=await db.page.findUnique({where:{id:'homepage'},select:{publishedSnapshot:true}});
 const published=await db.page.findMany({where:{deletedAt:null,publishedAt:{not:null}},select:{id:true,publishedSnapshot:true,publishedAt:true,deletedAt:true}});
 const seo=resolveSeoText(content.seo,{title:'Website, SEO, Branding & AI Services | CODEYEA',description:'Explore CODEYEA services for website design, e-commerce, SEO and GEO, branding, digital marketing, apps, AI automation and technical support.'});
 return <><JsonLd data={publicPageSchema('/services/',seo.title,seo.description,'CollectionPage')}/><ServicesPage content={content} shared={shared?.publishedSnapshot?snapshotSchema.parse(shared.publishedSnapshot).homepage:undefined} availablePaths={publishedPagePaths(published)}/><PublicTracking /></>;
}
