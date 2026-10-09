import '@/styles/homepage.css';
import '@/styles/homepage-interactions.css';
import '@/styles/homepage-motion.css';
import '@/styles/homepage-refinements.css';
import '@/styles/homepage-mobile.css';
import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {auth} from '@/server/auth';
import {requirePermission} from '@/server/permissions';
import {db} from '@/server/db';
import {snapshotSchema} from '@/schemas/content';
import {Homepage} from '@/components/sections/homepage';
export const dynamic='force-dynamic';
export const metadata={title:'Private homepage draft preview',robots:{index:false,follow:false}};
export default async function Preview(){const session=await auth.api.getSession({headers:await headers()});if(!session?.user)redirect('/login');await requirePermission(session.user.id,'view_admin');const page=await db.page.findUniqueOrThrow({where:{id:'homepage'},include:{sections:{orderBy:{position:'asc'}}}});const snapshot=snapshotSchema.parse(page.draftSnapshot??{title:page.title,sections:page.sections.map(({id,type,heading,body})=>({id,type,heading,body}))});return <><div style={{padding:8,background:'#072448',color:'white',fontSize:13}}>Private saved draft · version {page.version} · Not published</div><Homepage snapshot={snapshot}/></>;}
