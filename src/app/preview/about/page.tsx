import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { requirePermission } from "@/server/permissions";
import { db } from "@/server/db";
import { snapshotSchema } from "@/schemas/content";
import { AboutPage } from "@/components/sections/about-page";
import "@/styles/homepage.css";
import "@/styles/homepage-interactions.css";
import "@/styles/homepage-motion.css";
import "@/styles/homepage-refinements.css";
import "@/styles/homepage-mobile.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private About draft preview",
  robots: { index: false, follow: false },
};
export default async function PreviewAbout() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  await requirePermission(session.user.id, "view_admin");
  const page = await db.page.findFirst({
    where: { id: "about", deletedAt: null },
  });
  if (!page?.draftSnapshot) notFound();
  const snapshot = snapshotSchema.parse(page.draftSnapshot);
  if (!snapshot.about) notFound();
  const shared = await db.page.findUniqueOrThrow({
    where: { id: "homepage" },
    select: { draftSnapshot: true },
  });
  const homepage = shared.draftSnapshot
    ? snapshotSchema.parse(shared.draftSnapshot).homepage
    : undefined;
  return (
    <>
      <div className="about-preview-banner">
        Private About draft · version {page.version} · Not published
      </div>
      <AboutPage content={snapshot.about} shared={homepage} preview />
    </>
  );
}
