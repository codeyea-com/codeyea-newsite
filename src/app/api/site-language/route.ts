import { db } from "@/server/db";
import { documentSlugs } from "@/content/site-routes";
import { languageSwitchAllowed } from "@/content/site-language";
import { snapshotSchema } from "@/schemas/content";
import { noStore } from "@/server/http";
export async function GET(request: Request) {
  const country = request.headers.get("x-vercel-ip-country");
  if (!languageSwitchAllowed(country))
    return Response.json({ enabled: false }, { headers: noStore });
  const path = new URL(request.url).searchParams.get("path") || "/";
  const english = path.replace(/^\/ar(?=\/|$)/, "") || "/";
  const target = "/ar" + (english.startsWith("/") ? english : "/" + english);
  const slug = english.replace(/^\/+|\/+$/g, "");
  let available = false;
  if ((documentSlugs as readonly string[]).includes(slug)) {
    const document = await db.siteDocument.findUnique({
      where: { slug_locale: { slug, locale: "ar" } },
      select: { published: true },
    });
    available = !!document?.published;
  } else {
    const id =
      slug === ""
        ? "homepage"
        : slug.startsWith("industries/")
          ? slug.slice(11)
          : slug;
    const page = await db.page.findFirst({
      where: { id: "ar-" + id, deletedAt: null, publishedAt: { not: null } },
      select: { publishedSnapshot: true },
    });
    available =
      !!page?.publishedSnapshot &&
      snapshotSchema.safeParse(page.publishedSnapshot).success;
  }
  const home = await db.page.findFirst({
    where: { id: "ar-homepage", deletedAt: null, publishedAt: { not: null } },
    select: { publishedSnapshot: true },
  });
  available =
    available &&
    !!home?.publishedSnapshot &&
    snapshotSchema.safeParse(home.publishedSnapshot).success;
  const arabic = /^\/ar(?:\/|$)/.test(path);
  return Response.json(
    {
      enabled: available,
      href: arabic ? english : target,
      label: arabic ? "English" : "العربية",
    },
    { headers: noStore },
  );
}
