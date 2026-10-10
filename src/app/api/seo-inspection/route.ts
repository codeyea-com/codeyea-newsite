import { actor, failure, noStore } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import { inspectSeo } from "@/server/seo-inspection";
export async function GET(req: Request) {
  try {
    const user = await actor(req);
    await requirePermission(user?.id ?? null, "manage_settings");
    return Response.json(
      await inspectSeo(Object.fromEntries(new URL(req.url).searchParams)),
      { headers: noStore },
    );
  } catch (error) {
    return failure(error);
  }
}
