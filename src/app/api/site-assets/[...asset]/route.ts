import fs from "node:fs/promises";
import path from "node:path";
import {
  approvedTemplates,
  isPublicTemplateAsset,
  rewriteTemplateAssetCode,
  type DocumentContent,
} from "@/server/site-documents";
import { failure, noStore, actor } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import { db } from "@/server/db";
import {
  applyAssetControls,
  applyArtworkControls,
} from "@/server/template-controls";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ asset: string[] }> },
) {
  try {
    const { asset } = await params;
    const relative = asset.join("/");
    if (
      !/^(quote-review|shared-navigation|[a-z-]+-review|digital-service-template-preview)\/[a-zA-Z0-9_./-]+\.(css|js|png|jpg|jpeg|webp|svg|woff2)$/.test(
        relative,
      ) ||
      asset.some((part) => part === ".." || part === "." || part.includes("\\"))
    )
      return new Response("Not found", { status: 404 });
    const root = path.resolve("site-templates");
    const file = path.resolve(root, ...asset);
    if (!file.startsWith(root + path.sep))
      return new Response("Not found", { status: 404 });

    if (!isPublicTemplateAsset(relative))
      return new Response("Not found", { status: 404 });

    let body = await fs.readFile(file);
    const ext = path.extname(file);
    if (ext === ".css" || ext === ".js") {
      const url = new URL(req.url);
      const surface =
        url.searchParams.get("surface") === "public" ? "public" : "preview";
      const locale = url.searchParams.get("locale") === "ar" ? "ar" : "en";
      body = Buffer.from(
        rewriteTemplateAssetCode(relative, body.toString(), surface, locale),
      );
      const slug = url.searchParams.get("cms");
      if (
        slug &&
        approvedTemplates[slug] &&
        relative.startsWith(path.posix.dirname(approvedTemplates[slug]) + "/")
      ) {
        if (surface === "preview") {
          const user = await actor(req);
          await requirePermission(user?.id ?? null, "view_admin");
        }
        const doc = await db.siteDocument.findUnique({
          where: { slug_locale: { slug, locale } },
          select: { draft: true, published: true },
        });
        const content = (
          surface === "public"
            ? (doc?.published as { content?: DocumentContent } | null)?.content
            : doc?.draft
        ) as DocumentContent | undefined;
        body = Buffer.from(
          applyAssetControls(
            applyArtworkControls(body.toString(), relative, content?.controls),
            content?.controls,
          ),
        );
      }
    }
    const types: Record<string, string> = {
      ".css": "text/css",
      ".js": "text/javascript",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".woff2": "font/woff2",
    };
    return new Response(body, {
      headers: {
        ...noStore,
        "Content-Type": types[ext],
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return failure(error);
  }
}
