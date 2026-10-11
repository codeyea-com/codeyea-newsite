import { actor, failure, noStore } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import { db } from "@/server/db";
import { renderDocument, type DocumentContent } from "@/server/site-documents";
import { snapshotSchema } from "@/schemas/content";
export const dynamic = "force-dynamic";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await actor(req);
    await requirePermission(user?.id ?? null, "view_admin");
    const { slug } = await params;
    const query = new URL(req.url).searchParams;
    const locale = query.get("locale") === "ar" ? "ar" : "en";
    const doc = await db.siteDocument.findUnique({
      where: { slug_locale: { slug, locale } },
    });
    if (!doc || !doc.template)
      return new Response("Not found", { status: 404 });
    const home = await db.page.findUnique({
      where: { id: locale === "ar" ? "ar-homepage" : "homepage" },
      select: { draftSnapshot: true },
    });
    const shared = home?.draftSnapshot
      ? snapshotSchema.parse(home.draftSnapshot).homepage
      : undefined;
    let html = await renderDocument(
      doc.template,
      doc.draft as DocumentContent,
      locale,
      doc.title,
      { shared },
    );
    return new Response(html, {
      headers: {
        ...noStore,
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (e) {
    return failure(e);
  }
}
