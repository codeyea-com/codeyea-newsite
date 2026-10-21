import { db } from "@/server/db";
import { canonicalSiteHref } from "@/content/url-hierarchy";
import { documentSlugs } from "@/content/site-routes";
import { languageSwitchAllowed } from "@/content/site-language";
import { snapshotSchema } from "@/schemas/content";
import { noStore } from "@/server/http";
import { isCaseDetail } from "@/server/approved-case-detail";
export async function GET(request: Request) {
  const country = request.headers.get("x-vercel-ip-country");
  const localReview = process.env.NODE_ENV === 'development' &&
    ['127.0.0.1', 'localhost'].includes(new URL(request.url).hostname);
  if (!localReview && !languageSwitchAllowed(country))
    return Response.json({ enabled: false }, { headers: noStore });
  const path = canonicalSiteHref(new URL(request.url).searchParams.get("path") || "/");
  const english = path.replace(/^\/ar(?=\/|$)/, "") || "/";
  const target = "/ar" + (english.startsWith("/") ? english : "/" + english);
  const slug = english.replace(/^\/+|\/+$/g, "").replace(/^services\//, "");
  let available = false;
  if (slug === 'case-studies' || /^case-studies\/[^/]+$/.test(slug)) {
    // These bilingual pages are rendered from the public case catalogue, not CMS publications.
    return Response.json({
      enabled: slug === 'case-studies' || isCaseDetail(slug.slice('case-studies/'.length)),
      href: /^\/ar(?:\/|$)/.test(path) ? english : target,
      label: /^\/ar(?:\/|$)/.test(path) ? 'English' : 'العربية',
    }, {headers:noStore});
  } else if ((documentSlugs as readonly string[]).includes(slug)) {
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
