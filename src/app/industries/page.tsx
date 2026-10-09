import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { snapshotSchema } from "@/schemas/content";
import { IndustriesPage } from "@/components/sections/industries-page";
import { PublicTracking } from "@/components/cms/public-tracking";
import {publicRobots,resolveSeoText} from "@/content/seo";
import {pageMetadata,publicPageSchema} from '@/content/structured-data';
import {JsonLd} from '@/components/json-ld';
import {publishedSitePaths} from "@/content/site-routes";
const industriesMetadata = {title:"Industries We Serve | CODEYEA",description:"Digital solutions shaped around your industry, customers and workflows."};
import "@/styles/homepage.css";
import "@/styles/homepage-interactions.css";
import "@/styles/homepage-motion.css";
import "@/styles/homepage-refinements.css";
import "@/styles/homepage-mobile.css";
export const dynamic = "force-dynamic";
async function publishedIndustries() {
  const page = await db.page.findFirst({
    where: { id: "industries", deletedAt: null },
    select: { publishedSnapshot: true },
  });
  return page?.publishedSnapshot
    ? snapshotSchema.parse(page.publishedSnapshot).industriesPage
    : undefined;
}
export async function generateMetadata(): Promise<Metadata> {
  const industries = await publishedIndustries();
  const seo=resolveSeoText(industries?.seo,industriesMetadata);
  return {...pageMetadata('/industries/',seo.title,seo.description,seo),robots:publicRobots(!!industries,seo)};
}
export default async function Industries() {
  const industries = await publishedIndustries();
  if (!industries) notFound();
  const shared = await db.page.findUnique({
    where: { id: "homepage" },
    select: { publishedSnapshot: true },
  });
  const homepage = shared?.publishedSnapshot
    ? snapshotSchema.parse(shared.publishedSnapshot).homepage
    : undefined;
  const [publishedDetails,publishedDocuments]=await Promise.all([db.page.findMany({
    where:{deletedAt:null,publishedAt:{not:null}},
    select:{id:true,publishedSnapshot:true,publishedAt:true,deletedAt:true},
  }),db.siteDocument.findMany({where:{kind:'page'},select:{slug:true,locale:true,kind:true,published:true}})]);
  const availablePaths=publishedSitePaths({pages:publishedDetails,documents:publishedDocuments});
  const seo=resolveSeoText(industries.seo,industriesMetadata);
  return <><JsonLd data={publicPageSchema('/industries/',seo.title,seo.description,'CollectionPage')}/><IndustriesPage content={industries} shared={homepage} availablePaths={availablePaths}/><PublicTracking /></>;
}
