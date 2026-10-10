import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { requirePermission } from "@/server/permissions";
import { db } from "@/server/db";
import { snapshotSchema } from "@/schemas/content";
import { IndustriesPage } from "@/components/sections/industries-page";
import {pagePath} from '@/content/site-routes';
import "@/styles/homepage.css";
import "@/styles/homepage-interactions.css";
import "@/styles/homepage-motion.css";
import "@/styles/homepage-refinements.css";
import "@/styles/homepage-mobile.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private Industries draft preview",
  robots: { index: false, follow: false },
};
export default async function PreviewIndustries() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  await requirePermission(session.user.id, "view_admin");
  const page = await db.page.findFirst({
    where: { id: "industries", deletedAt: null },
  });
  if (!page?.draftSnapshot) notFound();
  const snapshot = snapshotSchema.parse(page.draftSnapshot);
  if (!snapshot.industriesPage) notFound();
  const shared = await db.page.findUniqueOrThrow({
    where: { id: "homepage" },
    select: { draftSnapshot: true },
  });
  const homepage = shared.draftSnapshot
    ? snapshotSchema.parse(shared.draftSnapshot).homepage
    : undefined;
  const drafts=await db.page.findMany({where:{deletedAt:null},select:{id:true,draftSnapshot:true}});
  const availablePaths=drafts.flatMap(page=>{const path=pagePath(page.id);return path&&page.draftSnapshot?[path]:[]});
  return (
    <>
      <div className="about-preview-banner">
        Private Industries draft · version {page.version} · Not published
      </div>
      <IndustriesPage content={snapshot.industriesPage} shared={homepage} preview availablePaths={availablePaths}/>
    </>
  );
}
