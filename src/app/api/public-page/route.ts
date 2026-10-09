import { db } from "@/server/db";
import { snapshotSchema } from "@/schemas/content";
export const dynamic = "force-dynamic";
export async function GET() {
  const page = await db.page.findFirst({
    where: { id: "homepage", deletedAt: null },
  });
  if (!page?.publishedSnapshot)
    return Response.json({ error: "Page not published" }, { status: 404 });
  return Response.json(snapshotSchema.parse(page.publishedSnapshot), {
    headers: { "Cache-Control": "no-store" },
  });
}
