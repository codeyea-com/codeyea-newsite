import { snapshotSchema } from "@/schemas/content";
import { defaultHomepage } from "@/content/homepage-defaults";
import { hasUnpublishedChanges } from "@/server/publication-state";
import { db } from "@/server/db";
import { actor, failure, jsonInput, noStore, sameOrigin } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import {
  saveDraft,
  initializeServices,
  initializeAbout,
  initializeIndustries,
  initializeRoofing,
  approvedAboutProjects,
} from "@/server/content";
import { AppError } from "@/server/errors";
import { z } from "zod";
import { cmsPageIds, industrySlugs } from "@/content/industry-registry";
import { initializeIndustry } from "@/server/industry-initialize";
import { beautyIndustrySnapshot } from "@/content/beauty-industry-defaults";
import { newIndustrySnapshot } from "@/content/new-industry-defaults";
import { basePageId } from "@/content/site-routes";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const user = await actor(request);
    const permissions = await requirePermission(user?.id ?? null, "view_admin");
    const pageId = z
      .enum(cmsPageIds)
      .parse(new URL(request.url).searchParams.get("pageId") ?? "homepage");
    const page = await db.page.findFirst({
      where: { id: pageId, deletedAt: null },
      include: { sections: { orderBy: { position: "asc" } } },
    });
    if (!page) throw new AppError(404, "Page not found");
    const revisionRows = await db.pageRevision.findMany({
      where: { pageId: page.id },
      orderBy: { version: "desc" },
      take: 51,
    });
    const revisions = revisionRows.slice(0, 50);
    const nextRevisionVersion =
      revisionRows.length > 50 ? revisions[revisions.length - 1].version : null;
    const audit = permissions.includes("view_audit")
      ? await db.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { actor: { select: { name: true } } },
        })
      : [];
    const saved = snapshotSchema.parse(
      page.draftSnapshot ?? {
        title: page.title,
        sections: page.sections.map(({ id, type, heading, body }) => ({
          id,
          type,
          heading,
          body,
        })),
      },
    );
    const pageDto = {
      ...page,
      ...saved,
      ...(basePageId(pageId) === "homepage"
        ? {
            homepage:
              saved.homepage ?? defaultHomepage(page.localeId, page.marketId),
          }
        : {}),
      hasUnpublishedChanges: hasUnpublishedChanges(
        saved,
        page.publishedSnapshot,
      ),
    };
    return Response.json(
      {
        user: { name: user!.name, email: user!.email },
        permissions,
        page: pageDto,
        ...(basePageId(pageId) === "about"
          ? {
              approvedProjects: approvedAboutProjects(
                (
                  await db.page.findUnique({
                    where: {
                      id: page.localeId === "ar" ? "ar-homepage" : "homepage",
                    },
                    select: { draftSnapshot: true },
                  })
                )?.draftSnapshot,
              ),
            }
          : {}),
        revisions,
        nextRevisionVersion,
        audit,
      },
      { headers: noStore },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await actor(request);
    const raw = await jsonInput(request, 262144);
    if (raw && typeof raw === "object" && "snapshot" in raw) {
      const input = z
        .object({
          pageId: z.enum(industrySlugs),
          templateVersion: z.literal(5),
          snapshot: snapshotSchema,
        })
        .strict()
        .parse(raw);
      return Response.json(await initializeIndustry(user?.id ?? null, input), {
        headers: noStore,
      });
    }
    const { pageId } = z
      .object({
        pageId: z.enum([
          "services",
          "about",
          "industries",
          "roofing",
          "beauty-skincare-med-spa",
          "restaurants-cafes-bakeries",
          "solar-energy",
        ]),
      })
      .strict()
      .parse(raw);
    if (pageId === "services")
      return Response.json(await initializeServices(user?.id ?? null), {
        headers: noStore,
      });
    if (
      pageId === "beauty-skincare-med-spa" ||
      pageId === "restaurants-cafes-bakeries" ||
      pageId === "solar-energy"
    ) {
      const roofing = await db.page.findUnique({ where: { id: "roofing" } });
      if (!roofing)
        throw new AppError(
          409,
          "The approved Roofing template is unavailable.",
        );
      const template = snapshotSchema.parse(roofing.draftSnapshot);
      return Response.json(
        await initializeIndustry(user?.id ?? null, {
          pageId,
          templateVersion: 5,
          snapshot:
            pageId === "beauty-skincare-med-spa"
              ? beautyIndustrySnapshot(template)
              : newIndustrySnapshot(template, pageId),
        }),
        { headers: noStore },
      );
    }
    return Response.json(
      await (
        pageId === "roofing"
          ? initializeRoofing
          : pageId === "about"
            ? initializeAbout
            : initializeIndustries
      )(user?.id ?? null),
      { headers: noStore },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const user = await actor(request);
    return Response.json(
      await saveDraft(user?.id ?? null, await jsonInput(request, 262144)),
      { headers: noStore },
    );
  } catch (error) {
    return failure(error);
  }
}
