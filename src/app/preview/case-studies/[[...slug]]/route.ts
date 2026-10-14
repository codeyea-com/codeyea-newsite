import { actor, failure, noStore } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import { conceptCaseStudy } from "@/content/concept-case-studies";
import {
  renderConceptCaseStudy,
  renderConceptCaseIndex,
} from "@/server/concept-case-study-render";

export const dynamic = "force-dynamic";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  try {
    const user = await actor(req);
    await requirePermission(user?.id ?? null, "view_admin");
    const parts = (await params).slug ?? [];
    const locale =
      new URL(req.url).searchParams.get("locale") === "ar" ? "ar" : "en";
    const item = parts.length === 1 ? conceptCaseStudy(parts[0]) : undefined;
    if (parts.length > 1 || (parts.length === 1 && !item))
      return new Response("Not found", { status: 404, headers: noStore });
    const html = item
      ? await renderConceptCaseStudy(item, locale)
      : await renderConceptCaseIndex(locale);
    return new Response(html, {
      headers: {
        ...noStore,
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    return failure(error);
  }
}
