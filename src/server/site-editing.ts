import { z } from "zod";
import { db } from "./db";
import { requirePermission } from "./permissions";
import { AppError } from "./errors";
import {approvedTemplates,bindTemplate,templateContent,templatePageDraft} from './site-documents';
import {seoTextSchema} from '@/schemas/seo-text';
import {documentPath} from '@/content/site-routes';
import { Prisma } from '@/generated/prisma/client';
import {documentSlugs} from '@/content/site-routes';
import {assertMediaReferences} from './media-references';
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
  seo: seoTextSchema.optional(),
  images:z.array(z.object({key:z.string().max(80),mediaId:z.string().max(100),alt:z.string().max(300),decorative:z.boolean()}).strict()).max(300).optional(),
  body: z.string().max(100000).optional(),
  image: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(60)).max(30).optional(),
});
export async function initializeTemplatePages(actorId:string|null){
 await requirePermission(actorId,'edit_pages');
 const templates=await Promise.all(documentSlugs.filter(slug=>approvedTemplates[slug]).map(async slug=>({slug,...templatePageDraft(slug,await templateContent(slug))})));
 return db.$transaction(async tx=>{
  await requirePermission(actorId,'edit_pages',tx);
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(71420398)`;
  const created:string[]=[],existing:string[]=[],conflicts:string[]=[];
  for(const template of templates){
   const prior=await tx.siteDocument.findUnique({where:{slug_locale:{slug:template.slug,locale:'en'}}});
   if(prior){(prior.kind==='page'&&prior.template===template.slug?existing:conflicts).push(template.slug);continue;}
   const doc=await tx.siteDocument.create({data:{slug:template.slug,locale:'en',kind:'page',title:template.title,template:template.slug,draft:template.content as Prisma.InputJsonValue}});
   await tx.siteDocumentRevision.create({data:{documentId:doc.id,version:doc.version,snapshot:{title:doc.title,draft:template.content} as Prisma.InputJsonValue,actorId:actorId!}});
   await tx.auditLog.create({data:{actorId:actorId!,entityType:'SiteDocument',entityId:doc.id,action:'page.draft_initialized',after:{slug:doc.slug,locale:doc.locale,template:doc.template}}});
   created.push(template.slug);
  }
  return {created,existing,conflicts};
 });
}
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
    await assertMediaReferences(tx,input.draft);
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

export async function publishSiteDocument(actorId: string | null, raw: unknown, action: "publish" | "unpublish") {
  const input = z.object({ id: z.string().min(1).max(100), version: z.number().int().positive() }).strict().parse(raw);
  return db.$transaction(async (tx) => {
    const doc = await tx.siteDocument.findUnique({ where: { id: input.id } });
    if (!doc) throw new AppError(404, "Page not found.");
    if (doc.kind !== "page") throw new AppError(400, "Post publishing is not enabled until the public blog route is ready.");
    await requirePermission(actorId, "publish_pages", tx);
    if (doc.version !== input.version) throw new AppError(409, "This page changed. Reload before publishing.");
    const content = documentContent.parse(doc.draft);
    if (action === "publish" && doc.kind === "page") {
      if (!doc.template || !documentPath(doc.slug, doc.locale)) throw new AppError(400, "This page has no registered public route.");
      bindTemplate(await templateContent(doc.template), content);
      await assertMediaReferences(tx,content);
      const canonical = documentPath(doc.slug, doc.locale);
      if (content.seo?.canonicalPath && content.seo.canonicalPath !== canonical) throw new AppError(400, "Canonical path must match this page route.");
      if (content.seo?.socialImage?.mediaId.startsWith("media_")) {
        const media = await tx.mediaAsset.findFirst({ where: { id: content.seo.socialImage.mediaId, state: "READY", archivedAt: null }, select: { id: true } });
        if (!media) throw new AppError(400, "The social image is unavailable or archived.");
      }
    }
    const updated = await tx.siteDocument.updateMany({ where: { id: doc.id, version: input.version }, data: { published: action === "publish" ? { title: doc.title, content } : Prisma.DbNull } });
    if (!updated.count) throw new AppError(409, "This page changed. Reload before publishing.");
    if (action === "publish" && !(await tx.siteDocumentPublication.findUnique({ where: { documentId_version: { documentId: doc.id, version: doc.version } }, select: { id: true } })))
      await tx.siteDocumentPublication.create({ data: { documentId: doc.id, version: doc.version, snapshot: { title: doc.title, content }, actorId: actorId! } });
    await tx.auditLog.create({ data: { actorId: actorId!, entityType: "SiteDocument", entityId: doc.id, action: action === "publish" ? "page.published" : "page.unpublished", after: action === "publish" ? { version: doc.version } : undefined } });
    return { ok: true, published: action === "publish", version: doc.version };
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
