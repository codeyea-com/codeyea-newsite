import { saveSiteDraft } from "@/server/site-editing";
import { z } from "zod";
import { db } from "@/server/db";
import { actor, failure, jsonInput, noStore, sameOrigin } from "@/server/http";
import { permissionsFor, requirePermission } from "@/server/permissions";
import { AppError } from "@/server/errors";
import {
  bindTemplate,
  bindDocumentControls,
  templateContent,
  type DocumentContent,
} from "@/server/site-documents";
export async function GET(req: Request) {
  try {
    const user = await actor(req);
    await requirePermission(user?.id ?? null, "view_admin");
    const id = new URL(req.url).searchParams.get("id");
    if (id) {
      const doc = await db.siteDocument.findUnique({ where: { id } });
      if (!doc) throw new AppError(404, "Page not found");
      if (doc.template) {
        const html = await templateContent(doc.template);
        doc.draft = (await bindDocumentControls(
          doc.template,
          html,
          bindTemplate(html, doc.draft as DocumentContent),
        )) as typeof doc.draft;
      }
      return Response.json(
        { document: doc, permissions: await permissionsFor(user?.id ?? null) },
        { headers: noStore },
      );
    }
    return Response.json(
      {
        documents: await db.siteDocument.findMany({
          select: {
            id: true,
            slug: true,
            title: true,
            kind: true,
            locale: true,
            version: true,
            updatedAt: true,
          },
          orderBy: [{ kind: "asc" }, { title: "asc" }],
        }),
        permissions: await permissionsFor(user?.id ?? null),
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
    await requirePermission(user?.id ?? null, "edit_posts");
    const input = z
      .object({
        title: z.string().trim().min(1).max(200),
        slug: z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .max(100),
        locale: z.enum(["en", "ar"]).default("en"),
      })
      .parse(await jsonInput(req));
    const doc = await db.siteDocument.create({
      data: {
        ...input,
        kind: "post",
        draft: {
          fields: [],
          description: "",
          body: "",
          category: "",
          tags: [],
          blog: { author: "", excerpt: "", categories: [] },
          seo: {
            title: input.title.slice(0, 110) + " | CODEYEA",
            description: `Read ${input.title} from CODEYEA.`,
            index: false,
            follow: true,
            canonicalPath: `${input.locale === "ar" ? "/ar" : ""}/blog/${input.slug}/`,
          },
        },
      },
    });
    return Response.json({ document: doc }, { status: 201, headers: noStore });
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(req: Request) {
  try {
    sameOrigin(req);
    const user = await actor(req);
    await saveSiteDraft(user?.id ?? null, await jsonInput(req, 300000));
    return Response.json({ ok: true }, { headers: noStore });
  } catch (e) {
    return failure(e);
  }
}
