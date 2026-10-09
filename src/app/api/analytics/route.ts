import { actor, failure, noStore } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import { analyticsReport } from "@/server/analytics-reports";
export async function GET(req: Request) {
  try {
    const user = await actor(req);
    await requirePermission(user?.id ?? null, "manage_settings");
    return Response.json(
      await analyticsReport(Object.fromEntries(new URL(req.url).searchParams)),
      { headers: noStore },
    );
  } catch (error) {
    return failure(error);
  }
}
