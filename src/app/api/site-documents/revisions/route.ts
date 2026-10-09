import { restoreSiteDraft } from "@/server/site-editing";
import { z } from "zod";
import { db } from "@/server/db";
import { actor, failure, jsonInput, noStore, sameOrigin } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import { AppError } from "@/server/errors";
export async function GET(req: Request) {
  try {
    const user = await actor(req);
    await requirePermission(user?.id ?? null, "view_admin");
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new AppError(400, "Document required");
    return Response.json(
      {
        revisions: await db.siteDocumentRevision.findMany({
          where: { documentId: id },
          select: { id: true, version: true, createdAt: true },
          orderBy: { version: "desc" },
          take: 30,
        }),
      },
      { headers: noStore },
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const user = await actor(req);
    await restoreSiteDraft(user?.id ?? null, await jsonInput(req));
    return Response.json({ ok: true }, { headers: noStore });
  } catch (e) {
    return failure(e);
  }
}
