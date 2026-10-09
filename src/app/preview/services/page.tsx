import {headers} from 'next/headers';
import {redirect,notFound} from 'next/navigation';
import {auth} from '@/server/auth';
import {requirePermission} from '@/server/permissions';
import {db} from '@/server/db';
import {snapshotSchema} from '@/schemas/content';
import {ServicesPage} from '@/components/sections/services-page';
import '@/styles/homepage.css';import '@/styles/homepage-interactions.css';import '@/styles/homepage-motion.css';import '@/styles/homepage-refinements.css';import '@/styles/homepage-mobile.css';
export const dynamic='force-dynamic';
export const metadata={title:'Private Services draft preview',robots:{index:false,follow:false}};
export default async function PreviewServices(){
 const session=await auth.api.getSession({headers:await headers()});if(!session?.user)redirect('/login');await requirePermission(session.user.id,'view_admin');
 const page=await db.page.findFirst({where:{id:'services',deletedAt:null}});if(!page?.draftSnapshot)notFound();const content=snapshotSchema.parse(page.draftSnapshot).servicesPage;if(!content)notFound();
 const shared=await db.page.findUnique({where:{id:'homepage'},select:{draftSnapshot:true}});
 const published=await db.page.findMany({where:{deletedAt:null,publishedAt:{not:null}},select:{slug:true}});
 return <><div className="about-preview-banner">Private Services draft · version {page.version} · Not published · Images temporary — image selection pending</div><ServicesPage content={content} shared={shared?.draftSnapshot?snapshotSchema.parse(shared.draftSnapshot).homepage:undefined} preview availablePaths={published.map(p=>'/'+p.slug+'/')}/></>;
}
