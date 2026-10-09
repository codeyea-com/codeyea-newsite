import "@/styles/homepage.css";
import "@/styles/homepage-interactions.css";
import "@/styles/homepage-motion.css";
import "@/styles/homepage-refinements.css";
import "@/styles/homepage-mobile.css";
import { db } from "@/server/db";
import { snapshotSchema } from "@/schemas/content";
import { Homepage } from "@/components/sections/homepage";
import { PublicTracking } from "@/components/cms/public-tracking";
import type {Metadata} from "next";
import {publicRobots,resolveSeoText} from "@/content/seo";
import {homeSchema,pageMetadata} from '@/content/structured-data';
import {JsonLd} from '@/components/json-ld';

export const dynamic = "force-dynamic";
export async function generateMetadata():Promise<Metadata>{
 const page=await db.page.findFirst({where:{id:"homepage",deletedAt:null},select:{publishedSnapshot:true}});
 const parsed=page?.publishedSnapshot?snapshotSchema.safeParse(page.publishedSnapshot):undefined;
 const published=Boolean(parsed?.success);
 const seo=resolveSeoText(parsed?.success?parsed.data.homepage?.seo:undefined,{title:"Website Design, SEO & Digital Services | CODEYEA",description:"CODEYEA builds websites, apps, e-commerce experiences and digital growth systems for businesses worldwide."});
 return {...pageMetadata('/',seo.title,seo.description,seo),robots:publicRobots(published,seo)};
}

export default async function Home() {
  const page = await db.page.findFirst({
    where: { id: "homepage", deletedAt: null },
    select: { publishedSnapshot: true },
  });
  const snapshot = page?.publishedSnapshot
    ? snapshotSchema.parse(page.publishedSnapshot)
    : null;
  const seo=resolveSeoText(snapshot?.homepage?.seo, {title:"Website Design, SEO & Digital Services | CODEYEA",description:"CODEYEA builds websites, apps, e-commerce experiences and digital growth systems for businesses worldwide."});
  return <><JsonLd data={homeSchema(seo.title,seo.description)}/><Homepage snapshot={snapshot} /><PublicTracking /></>;
}
