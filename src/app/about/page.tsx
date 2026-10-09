import type { Metadata } from "next";
import { db } from "@/server/db";
import { snapshotSchema } from "@/schemas/content";
import { AboutPage } from "@/components/sections/about-page";
import { PublicTracking } from "@/components/cms/public-tracking";
import { aboutMetadata, defaultAbout } from "@/content/about-defaults";
import { defaultHomepage } from "@/content/homepage-defaults";
import {publicRobots} from "@/content/seo";
import {pageMetadata,publicPageSchema} from '@/content/structured-data';
import {JsonLd} from '@/components/json-ld';
import "@/styles/homepage.css";
import "@/styles/homepage-interactions.css";
import "@/styles/homepage-motion.css";
import "@/styles/homepage-refinements.css";
import "@/styles/homepage-mobile.css";
export const dynamic = "force-dynamic";
async function publishedAbout() {
  const page = await db.page.findFirst({
    where: { id: "about", deletedAt: null },
    select: { publishedSnapshot: true },
  });
  return page?.publishedSnapshot
    ? snapshotSchema.parse(page.publishedSnapshot).about
    : undefined;
}
export async function generateMetadata(): Promise<Metadata> {
  const about = await publishedAbout();
  const seo=about?.seo??aboutMetadata;
  return {...pageMetadata('/about/',seo.title,seo.description,seo),robots:publicRobots(!!about,seo)};
}
export default async function About() {
  const about = (await publishedAbout()) ?? defaultAbout();
  const shared = await db.page.findUnique({
    where: { id: "homepage" },
    select: { publishedSnapshot: true },
  });
  const homepage = shared?.publishedSnapshot
    ? snapshotSchema.parse(shared.publishedSnapshot).homepage
    : defaultHomepage();
  const seo=about.seo??aboutMetadata;
  return <><JsonLd data={publicPageSchema('/about/',seo.title,seo.description,'AboutPage')}/><AboutPage content={about} shared={homepage} /><PublicTracking /></>;
}
