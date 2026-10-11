import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "./db";
import { snapshotSchema } from "@/schemas/content";
import { Homepage } from "@/components/sections/homepage";
import { AboutPage } from "@/components/sections/about-page";
import { ServicesPage } from "@/components/sections/services-page";
import { IndustriesPage } from "@/components/sections/industries-page";
import { IndustryDetailPage } from "@/components/sections/industry-detail-page";
import { ArabicSurface } from "@/components/sections/arabic-surface";
import { pagePath, documentSlugs } from "@/content/site-routes";
import { englishPageIds } from "@/content/industry-registry";
import { publicRobots, siteOrigin } from "@/content/seo";
import { pageMetadata } from "@/content/structured-data";
import "@/styles/homepage.css";
import "@/styles/homepage-interactions.css";
import "@/styles/homepage-motion.css";
import "@/styles/homepage-refinements.css";
import "@/styles/homepage-mobile.css";
async function load(id: string, preview: boolean) {
  if (!(englishPageIds as readonly string[]).includes(id)) notFound();
  const [page, home, directory] = await Promise.all(
    ["ar-" + id, "ar-homepage", "ar-industries"].map((id) =>
      db.page.findFirst({ where: { id, deletedAt: null } }),
    ),
  );
  const snapshot = snapshotSchema.safeParse(
    preview ? page?.draftSnapshot : page?.publishedSnapshot,
  );
  const shared = snapshotSchema.safeParse(
    preview ? home?.draftSnapshot : home?.publishedSnapshot,
  );
  const industries = snapshotSchema.safeParse(
    preview ? directory?.draftSnapshot : directory?.publishedSnapshot,
  );
  if (
    !snapshot.success ||
    !shared.success ||
    !shared.data.homepage ||
    (!preview && (!page?.publishedAt || !home?.publishedAt))
  )
    notFound();
  return {
    snapshot: snapshot.data,
    shared: shared.data.homepage,
    industryItems: industries.success
      ? (industries.data.industriesPage?.items ?? [])
      : [],
    version: page!.version,
  };
}
export async function arabicMetadata(id: string): Promise<Metadata> {
  const { snapshot } = await load(id, false);
  const seo =
    snapshot.homepage?.seo ??
    snapshot.about?.seo ??
    snapshot.servicesPage?.seo ??
    snapshot.industriesPage?.seo ??
    snapshot.industryDetail?.seo;
  if (!seo) notFound();
  const path = pagePath("ar-" + id)!;
  const english = await db.page.findFirst({
    where: { id, deletedAt: null },
    select: { publishedSnapshot: true, publishedAt: true },
  });
  const parsed = snapshotSchema.safeParse(english?.publishedSnapshot);
  const counterpart = parsed.success
    ? (parsed.data.homepage?.seo ??
      parsed.data.about?.seo ??
      parsed.data.servicesPage?.seo ??
      parsed.data.industriesPage?.seo ??
      parsed.data.industryDetail?.seo)
    : undefined;
  const languages =
    process.env.SITE_INDEXING_ENABLED === "true" &&
    seo.index !== false &&
    english?.publishedAt &&
    counterpart &&
    counterpart.index !== false
      ? {
          en: new URL(pagePath(id)!, siteOrigin).href,
          ar: new URL(path, siteOrigin).href,
        }
      : undefined;
  return {
    ...pageMetadata(path, seo.title, seo.description, seo),
    alternates: {
      canonical: new URL(path, siteOrigin).href,
      ...(languages ? { languages } : {}),
    },
    robots: publicRobots(true, seo),
  };
}
export async function ArabicPageView({
  id,
  preview = false,
}: {
  id: string;
  preview?: boolean;
}) {
  const { snapshot, shared, industryItems, version } = await load(id, preview);
  const availablePaths = [
    ...englishPageIds.flatMap((id) => [pagePath(id)!, pagePath("ar-" + id)!]),
    ...documentSlugs.flatMap((slug) => [`/${slug}/`, `/ar/${slug}/`]),
  ];
  return (
    <ArabicSurface>
      {preview && (
        <div className="about-preview-banner">
          مسودة عربية خاصة · الإصدار {version} · غير منشورة
        </div>
      )}
      {snapshot.homepage ? (
        <Homepage snapshot={snapshot} />
      ) : snapshot.about ? (
        <AboutPage content={snapshot.about} shared={shared} preview={preview} />
      ) : snapshot.servicesPage ? (
        <ServicesPage
          content={snapshot.servicesPage}
          shared={shared}
          preview={preview}
          availablePaths={availablePaths}
        />
      ) : snapshot.industriesPage ? (
        <IndustriesPage
          content={snapshot.industriesPage}
          shared={shared}
          preview={preview}
          availablePaths={availablePaths}
        />
      ) : snapshot.industryDetail ? (
        <IndustryDetailPage
          content={snapshot.industryDetail}
          shared={shared}
          preview={preview}
          availablePaths={availablePaths}
          industryItems={industryItems}
        />
      ) : null}
    </ArabicSurface>
  );
}
