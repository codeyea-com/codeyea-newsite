import {notFound,redirect} from 'next/navigation';import {industryPageData} from '@/server/industry-detail-page';import {IndustryDetailPage} from '@/components/sections/industry-detail-page';import {PublicTracking} from '@/components/cms/public-tracking';import {isIndustrySlug,industryNames} from '@/content/industry-registry';
import {industryIdentitySeo} from '@/content/industry-identity-seo';
import {publicRobots} from '@/content/seo';
import {pageMetadata,publicPageSchema} from '@/content/structured-data';
import {JsonLd} from '@/components/json-ld';
import type {Metadata} from 'next';
import '@/styles/homepage.css';import '@/styles/homepage-interactions.css';import '@/styles/homepage-motion.css';import '@/styles/homepage-refinements.css';import '@/styles/homepage-mobile.css';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 if(!isIndustrySlug(slug))return {robots:publicRobots(false)};
 const data=await industryPageData(slug);
 const title=data?.detail.seo?.title??`Digital Services for ${industryNames[slug]} | CODEYEA`;
 const description=data?.detail.seo?.description??`Practical websites, search visibility, branding and connected digital workflows for ${industryNames[slug].toLowerCase()} businesses.`;
 return {...pageMetadata(`/industries/${slug}/`,title,description,data?.detail.seo),robots:publicRobots(!!data,data?.detail.seo)};
}
export default async function Industry({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!isIndustrySlug(slug))notFound();const data=await industryPageData(slug);if(!data)redirect('/industries/');const identity=industryIdentitySeo(data.detail);const title=identity?.title??data.detail.seo?.title??`Digital Services for ${industryNames[slug]} | CODEYEA`;const description=identity?.description??data.detail.seo?.description??`Practical websites, search visibility, branding and connected digital workflows for ${industryNames[slug].toLowerCase()} businesses.`;return <><JsonLd data={publicPageSchema(`/industries/${slug}/`,title,description)}/><IndustryDetailPage content={data.detail} industryItems={data.industryItems} shared={data.shared} availablePaths={data.availablePaths}/><PublicTracking /></>}
