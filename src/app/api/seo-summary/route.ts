import { db } from "@/server/db";
import { actor, failure, noStore } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import { buildPageCatalog } from "@/content/page-catalog";
import { assessSeo, editorialText } from "@/content/seo-assessment";
import type { SeoText } from "@/schemas/seo-text";

export async function GET(req: Request) {
  try {
    const user = await actor(req);
    await requirePermission(user?.id ?? null, "view_admin");
    const [pages, documents] = await Promise.all([
      db.page.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          publishedAt: true,
          publishedSnapshot: true,
          draftSnapshot: true,
          updatedAt: true,
        },
      }),
      db.siteDocument.findMany({
        where: { kind: "page" },
        select: {
          id: true,
          title: true,
          slug: true,
          locale: true,
          published: true,
          draft: true,
          updatedAt: true,
          kind: true,
        },
      }),
    ]);
    const records = buildPageCatalog({ pages, documents })
      .filter((row) => row.path && row.status !== "Missing CMS record")
      .map((row) => {
        const snapshot = (
          row.source === "page"
            ? pages.find((p) => p.id === row.id)?.draftSnapshot
            : documents.find((p) => p.id === row.id)?.draft
        ) as Record<string, unknown> | null;
        const content =
          snapshot &&
          (snapshot.homepage ??
            snapshot.about ??
            snapshot.servicesPage ??
            snapshot.industriesPage ??
            snapshot.industryDetail ??
            snapshot);
        const seo =
          (content as { seo?: SeoText } | null)?.seo ??
          (row.source === "document"
            ? {
                title: row.title,
                description:
                  (content as { description?: string } | null)?.description ??
                  "",
              }
            : undefined);
        return {
          ...row,
          focusPhrase: seo?.focusPhrase ?? "",
          indexAllowed: seo?.index !== false,
          followAllowed: seo?.follow !== false,
          ...(snapshot
            ? assessSeo(seo, row.path!, editorialText(content))
            : {
                score: null,
                contentScore: null,
                checks: [],
                contentChecks: [],
              }),
        };
      });
    return Response.json(
      {
        pages: records,
        indexingEnabled: process.env.SITE_INDEXING_ENABLED === "true",
        fetchedAt: new Date().toISOString(),
      },
      { headers: noStore },
    );
  } catch (error) {
    return failure(error);
  }
}
