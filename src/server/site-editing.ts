import { z } from "zod";
import { db } from "./db";
import { requirePermission } from "./permissions";
import { AppError } from "./errors";
import {bindTemplate,templateContent} from './site-documents';
export const documentContent = z.object({
  templateHash:z.string().regex(/^[a-f0-9]{64}$/).optional(),
  fields: z
    .array(
      z.object({
        key: z.string().max(80),
        label: z.string().max(200),
        value: z.string().max(12000),
      }),
    )
    .max(2000),
  description: z.string().max(320),
  body: z.string().max(100000).optional(),
  image: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(60)).max(30).optional(),
});
const saveInput = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  title: z.string().min(1).max(200),
  draft: documentContent,
});
const restoreInput = z.object({
  id: z.string(),
  revisionId: z.string(),
  version: z.number().int().positive(),
});
const snapshot = z.object({
  title: z.string().min(1).max(200),
  draft: documentContent,
});
export async function saveSiteDraft(actorId: string | null, raw: unknown) {
  const input = saveInput.parse(raw);
  await db.$transaction(async (tx) => {
    const doc = await tx.siteDocument.findUnique({ where: { id: input.id } });
    if (!doc) throw new AppError(404, "Page not found");
    await requirePermission(
      actorId,
      doc.kind === "post" ? "edit_posts" : "edit_pages",
      tx,
    );
    if (doc.version !== input.version)
      throw new AppError(409, "This page changed. Reload before saving.");
    if (doc.template) {
      const html = await templateContent(doc.template);
      const previous = bindTemplate(html, documentContent.parse(doc.draft));
      input.draft=bindTemplate(html,input.draft);
      if (
        input.draft.fields.length !== previous.fields.length ||
        input.draft.fields.some((f, i) => f.key !== previous.fields[i].key)
      )
        throw new AppError(
          400,
          "Page structure cannot be changed by this editor",
        );
    }
    const result = await tx.siteDocument.updateMany({
      where: { id: doc.id, version: input.version },
      data: {
        title: input.title,
        draft: input.draft,
        version: { increment: 1 },
      },
    });
    if (!result.count)
      throw new AppError(409, "This page changed. Reload before saving.");
    await tx.siteDocumentRevision.create({
      data: {
        documentId: doc.id,
        version: doc.version,
        snapshot: snapshot.parse({ title: doc.title, draft: doc.draft }),
        actorId: actorId!,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: actorId!,
        entityType: "SiteDocument",
        entityId: doc.id,
        action: "draft.saved",
      },
    });
  });
}
export async function restoreSiteDraft(actorId: string | null, raw: unknown) {
  const input = restoreInput.parse(raw);
  await db.$transaction(async (tx) => {
    const doc = await tx.siteDocument.findUnique({ where: { id: input.id } });
    if (!doc) throw new AppError(404, "Page not found");
    await requirePermission(
      actorId,
      doc.kind === "post" ? "edit_posts" : "edit_pages",
      tx,
    );
    if (doc.version !== input.version)
      throw new AppError(409, "This draft changed. Reload before restoring.");
    const revision = await tx.siteDocumentRevision.findFirst({
      where: { id: input.revisionId, documentId: doc.id },
    });
    if (!revision) throw new AppError(404, "Revision not found");
    const restored = snapshot.safeParse(revision.snapshot);
    if (!restored.success)
      throw new AppError(
        400,
        "This older revision needs migration before restoration.",
      );
    if(doc.template)restored.data.draft=bindTemplate(await templateContent(doc.template),restored.data.draft);
    const changed = await tx.siteDocument.updateMany({
      where: { id: doc.id, version: input.version },
      data: {
        title: restored.data.title,
        draft: restored.data.draft,
        version: { increment: 1 },
      },
    });
    if (!changed.count)
      throw new AppError(409, "This draft changed. Reload before restoring.");
    await tx.siteDocumentRevision.create({
      data: {
        documentId: doc.id,
        version: doc.version,
        snapshot: snapshot.parse({ title: doc.title, draft: doc.draft }),
        actorId: actorId!,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: actorId!,
        entityType: "SiteDocument",
        entityId: doc.id,
        action: "draft.restored",
      },
    });
  });
}
