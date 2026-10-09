import { db } from "@/server/db";
import { actor, failure, noStore } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import {z} from 'zod';
import {cmsPageIds} from '@/content/industry-registry';

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const user = await actor(request);
    await requirePermission(user?.id ?? null, "view_admin");
    const pageId=z.enum(cmsPageIds).parse(new URL(request.url).searchParams.get('pageId')??'homepage');
    const value = new URL(request.url).searchParams.get("beforeVersion");
    const beforeVersion = Number(value);
    if (!value || !Number.isSafeInteger(beforeVersion) || beforeVersion < 1) {
      return Response.json(
        { error: "A positive beforeVersion is required." },
        { status: 400, headers: noStore },
      );
    }
    const rows = await db.pageRevision.findMany({
      where: { pageId, version: { lt: beforeVersion } },
      orderBy: { version: "desc" },
      take: 51,
    });
    const revisions = rows.slice(0, 50);
    return Response.json(
      {
        revisions,
        nextRevisionVersion:
          rows.length > 50 ? revisions[revisions.length - 1].version : null,
      },
      { headers: noStore },
    );
  } catch (error) {
    return failure(error);
  }
}
