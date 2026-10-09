import {notFound,redirect} from 'next/navigation';import {roofingPageData} from '@/server/industry-detail-page';import {IndustryDetailPage} from '@/components/sections/industry-detail-page';
import {publicRobots} from '@/content/seo';
import {pageMetadata,publicPageSchema} from '@/content/structured-data';
import {JsonLd} from '@/components/json-ld';
import type {Metadata} from 'next';
import '@/styles/homepage.css';import '@/styles/homepage-interactions.css';import '@/styles/homepage-motion.css';import '@/styles/homepage-refinements.css';import '@/styles/homepage-mobile.css';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{
 const data=await roofingPageData();
 const title=data?.detail.seo?.title??'Digital Services for Roofing Companies | CODEYEA';
 const description=data?.detail.seo?.description??'Websites, search visibility, project content and connected estimate workflows for roofing companies.';
 return {...pageMetadata('/industries/roofing/',title,description,data?.detail.seo),robots:publicRobots(true,data?.detail.seo)};
}
export default async function Roofing(){const data=await roofingPageData();if(!data)redirect('/industries/');const title=data.detail.seo?.title??'Digital Services for Roofing Companies | CODEYEA';const description=data.detail.seo?.description??'Websites, search visibility, project content and connected estimate workflows for roofing companies.';return <><JsonLd data={publicPageSchema('/industries/roofing/',title,description)}/><IndustryDetailPage content={data.detail} industryItems={data.industryItems} shared={data.shared} availablePaths={data.availablePaths}/></>}
