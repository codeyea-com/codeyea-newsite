import {assertMediaReferences} from "./media-references";
import {assertPageSnapshot} from './content';
import { isWriteConflict } from "./write-conflict";
import { z } from "zod";
import { db } from "./db";
import { requirePermission } from "./permissions";
import { AppError } from "./errors";
import { snapshotSchema } from "../schemas/content";
import { Prisma } from "../generated/prisma/client";
import { hasUnpublishedChanges } from "./publication-state";
const publishSchema = z
  .object({
    pageId: z.string().min(1).max(100),
    expectedVersion: z.number().int().positive(),
  })
  .strict();
export async function publishDraft(actorId: string | null, input: unknown) {
  await requirePermission(actorId, "publish_pages");
  const { pageId, expectedVersion } = publishSchema.parse(input);
  try {
    return await db.$transaction(
      async (tx) => {
        await requirePermission(actorId, "publish_pages", tx);
        await tx.$queryRaw`SELECT id FROM "Page" WHERE id=${pageId} FOR UPDATE`;
        const page = await tx.page.findFirst({
          where: { id: pageId, deletedAt: null },
          include: { sections: { orderBy: { position: "asc" } } },
        });
        if (!page) throw new AppError(404, "Page not found");
        if (page.version !== expectedVersion)
          throw new AppError(
            409,
            "This draft changed. Reload before publishing.",
          );
        const snapshot = snapshotSchema.parse(page.draftSnapshot ?? {
          title: page.title,
          sections: page.sections.map(({ id, type, heading, body }) => ({
            id,
            type,
            heading,
            body,
          })),
        });
        await assertMediaReferences(tx,snapshot);
        await assertPageSnapshot(tx,page,snapshot,'published');
        if (!hasUnpublishedChanges(snapshot, page.publishedSnapshot))
          throw new AppError(409, "This saved draft is already published.");
        const publishedAt = new Date();
        await tx.pagePublication.create({
          data: {
            pageId,
            version: page.version,
            actorId: actorId!,
            snapshot: snapshot as Prisma.InputJsonValue,
            previousSnapshot: page.publishedSnapshot ?? Prisma.DbNull,
            previousPublishedAt: page.publishedAt,
            publishedAt,
          },
        });
        const updated = await tx.page.update({
          where: { id: pageId },
          data: {
            publishedSnapshot: snapshot as Prisma.InputJsonValue,
            publishedAt,
            status: "PUBLISHED",
            scheduledAt: null,
            version: { increment: 1 },
            updatedBy: actorId,
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: actorId!,
            actorKind: "USER",
            entityType: "Page",
            entityId: pageId,
            action: "page.published",
            before: page.publishedSnapshot ?? Prisma.DbNull,
            after: snapshot as Prisma.InputJsonValue,
          },
        });
        return {
          version: updated.version,
          publishedAt,
          hasUnpublishedChanges: false,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (
      isWriteConflict(error)
    )
      throw new AppError(409, "This draft changed. Reload before publishing.");
    throw error;
  }
}
