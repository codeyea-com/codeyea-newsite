import {headers} from 'next/headers';import {redirect,notFound} from 'next/navigation';import {auth} from '@/server/auth';import {requirePermission} from '@/server/permissions';import {industryPageData} from '@/server/industry-detail-page';import {IndustryDetailPage} from '@/components/sections/industry-detail-page';import {isIndustrySlug,industryNames} from '@/content/industry-registry';
import {industryIdentitySeo} from '@/content/industry-identity-seo';
import '@/styles/homepage.css';import '@/styles/homepage-interactions.css';import '@/styles/homepage-motion.css';import '@/styles/homepage-refinements.css';import '@/styles/homepage-mobile.css';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const fallback={title:'Private industry draft preview',robots:{index:false,follow:false}};
 const {slug}=await params;if(!isIndustrySlug(slug)||!['e-commerce','oil-and-gas','beauty-skincare-med-spa','restaurants-cafes-bakeries','solar-energy'].includes(slug))return fallback;
 const session=await auth.api.getSession({headers:await headers()});if(!session?.user)return fallback;
 await requirePermission(session.user.id,'view_admin');const data=await industryPageData(slug,true);const identity=data?industryIdentitySeo(data.detail):undefined;
 return identity?{title:identity.title,description:identity.description,openGraph:identity.openGraph,robots:fallback.robots}:data?.detail.seo?{title:data.detail.seo.title,description:data.detail.seo.description,openGraph:{title:data.detail.seo.title,description:data.detail.seo.description},robots:fallback.robots}:fallback;
}
export default async function PreviewIndustry({params}:{params:Promise<{slug:string}>}){const session=await auth.api.getSession({headers:await headers()});if(!session?.user)redirect('/login');await requirePermission(session.user.id,'view_admin');const {slug}=await params;if(!isIndustrySlug(slug))notFound();const data=await industryPageData(slug,true);if(!data)notFound();return <><div className="about-preview-banner">Private {industryNames[slug]} draft · version {data.version} · Not published</div><IndustryDetailPage content={data.detail} industryItems={data.industryItems} shared={data.shared} availablePaths={data.availablePaths} preview/></>}
