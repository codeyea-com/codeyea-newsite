import { isDeepStrictEqual } from "node:util";
import { assertMediaReferences } from "./media-references";
import { isWriteConflict } from "./write-conflict";
import { db } from "./db";
import {
  draftSchema,
  restoreSchema,
  snapshotSchema,
  type Snapshot,
} from "../schemas/content";
import { requirePermission } from "./permissions";
import { AppError } from "./errors";
import { Prisma } from "../generated/prisma/client";
import { defaultAbout } from "../content/about-defaults";
import { defaultIndustries } from "../content/industries-defaults";
import { defaultRoofing } from "../content/roofing-defaults";
import { defaultServices } from "../content/services-defaults";
import { isIndustrySlug } from "../content/industry-registry";
import { resolveHomepage } from "../content/homepage-defaults";
import { safeHref } from "../schemas/contract-primitives";
import { editorMediaSchema } from "../schemas/homepage-editor";
import { pagePath, basePageId } from "../content/site-routes";

export function approvedAboutProjects(snapshot: unknown) {
  const projects =
    (
      snapshot as {
        homepage?: {
          projects?: {
            items?: {
              id: string;
              enabled: boolean;
              approved?: boolean;
              title?: string;
              body?: string;
              href?: string;
              media?: unknown;
            }[];
          };
        };
      } | null
    )?.homepage?.projects?.items ?? [];
  return projects
    .filter(
      (p) =>
        p.enabled &&
        p.approved === true &&
        p.title?.trim() &&
        p.body?.trim() &&
        safeHref.safeParse(p.href).success &&
        editorMediaSchema.safeParse(p.media).success,
    )
    .map((p) => ({ id: p.id, title: p.title! }));
}

export async function assertPageSnapshot(
  tx: Prisma.TransactionClient,
  page: { id: string; localeId: string; marketId: string },
  next: Snapshot,
  sharedSource: "draft" | "published" = "draft",
) {
  const id = basePageId(page.id);
  const seo =
    next.homepage?.seo ??
    next.about?.seo ??
    next.servicesPage?.seo ??
    next.industriesPage?.seo ??
    next.industryDetail?.seo;
  const expectedPath = pagePath(page.id);
  if (seo?.canonicalPath && seo.canonicalPath !== expectedPath)
    throw new AppError(400, "Canonical path must match this page route.");
  if ((id === "services") !== Boolean(next.servicesPage))
    throw new AppError(400, "Snapshot content must match its page.");
  if (
    next.servicesPage &&
    (next.servicesPage.localeId !== page.localeId ||
      next.servicesPage.marketId !== page.marketId)
  )
    throw new AppError(400, "Services locale and market cannot be changed.");
  if ((id === "about") !== Boolean(next.about))
    throw new AppError(400, "Snapshot content must match its page.");
  if ((id === "industries") !== Boolean(next.industriesPage))
    throw new AppError(400, "Snapshot content must match its page.");
  if (
    isIndustrySlug(id) !== Boolean(next.industryDetail) ||
    (next.industryDetail && next.industryDetail.slug !== id)
  )
    throw new AppError(400, "Snapshot content must match its page.");
  if (
    next.industryDetail &&
    (next.industryDetail.localeId !== page.localeId ||
      next.industryDetail.marketId !== page.marketId)
  )
    throw new AppError(
      400,
      "Industry detail locale and market cannot be changed.",
    );
  if (
    next.industriesPage &&
    (next.industriesPage.localeId !== page.localeId ||
      next.industriesPage.marketId !== page.marketId)
  )
    throw new AppError(400, "Industries locale and market cannot be changed.");
  if (next.about) {
    if (
      next.about.localeId !== page.localeId ||
      next.about.marketId !== page.marketId
    )
      throw new AppError(400, "About locale and market cannot be changed.");
    const work = next.about.sections.find((s) => s.type === "selectedWork");
    if (work && (work.items.length || work.media))
      throw new AppError(
        400,
        "Selected work must reference approved shared projects only.",
      );
    if (work && (work.enabled || work.projectIds!.length)) {
      const source = await tx.page.findFirst({
        where: {
          id: page.localeId === "ar" ? "ar-homepage" : "homepage",
          deletedAt: null,
        },
        select: { draftSnapshot: true, publishedSnapshot: true },
      });
      const projects = approvedAboutProjects(
        sharedSource === "published"
          ? source?.publishedSnapshot
          : source?.draftSnapshot,
      );
      if (
        (work.enabled && !work.projectIds!.length) ||
        work.projectIds!.some((id) => !projects.some((p) => p.id === id))
      )
        throw new AppError(
          400,
          "Choose real approved shared projects before enabling selected work.",
        );
    }
  }
}

export async function initializeServices(actorId: string | null) {
  await requirePermission(actorId, "edit_pages");
  return db.$transaction(async (tx) => {
    await requirePermission(actorId, "edit_pages", tx);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(71420396)`;
    const existing = await tx.page.findUnique({
      where: { id: "services" },
      include: { sections: true },
    });
    if (existing) {
      if (existing.deletedAt) throw new AppError(409, "Services is archived.");
      return existing;
    }
    const source = await tx.page.findFirst({
      where: { id: "homepage", deletedAt: null },
    });
    if (!source) throw new AppError(404, "Shared homepage not found");
    const industries = await tx.page.findFirst({
      where: { id: "industries", deletedAt: null },
    });
    const about = await tx.page.findFirst({
      where: { id: "about", deletedAt: null },
    });
    const media =
      (industries
        ? snapshotSchema.parse(industries.draftSnapshot).industriesPage
        : undefined
      )?.hero.media ??
      defaultIndustries(source.localeId, source.marketId).hero.media;
    const cards =
      (about
        ? snapshotSchema.parse(about.draftSnapshot).about
        : undefined
      )?.sections
        .find((s) => s.type === "projectReference")
        ?.items.flatMap((i) => (i.media ? [i.media] : [])) ?? [];
    const shared = snapshotSchema.parse(source.draftSnapshot);
    const configured = String(resolveHomepage(shared.homepage).footer.ctaHref);
    const contact = configured.startsWith("https://")
      ? configured
      : "https://codeyea.com/contact/";
    const snapshot = snapshotSchema.parse({
      title: "Services",
      sections: [],
      servicesPage: defaultServices(
        source.localeId,
        source.marketId,
        media,
        cards,
        contact,
      ),
    });
    await assertPageSnapshot(
      tx,
      { id: "services", localeId: source.localeId, marketId: source.marketId },
      snapshot,
    );
    await assertMediaReferences(tx, snapshot);
    const page = await tx.page.create({
      data: {
        id: "services",
        slug: "services",
        title: "Services",
        localeId: source.localeId,
        marketId: source.marketId,
        status: "DRAFT",
        draftSnapshot: snapshot as Prisma.InputJsonValue,
        createdBy: actorId,
        updatedBy: actorId,
      },
      include: { sections: true },
    });
    await tx.auditLog.create({
      data: {
        actorId: actorId!,
        action: "page.draft_initialized",
        entityType: "Page",
        entityId: page.id,
        after: snapshot as Prisma.InputJsonValue,
      },
    });
    return page;
  });
}

export async function initializeRoofing(actorId: string | null) {
  await requirePermission(actorId, "edit_pages");
  return db.$transaction(async (tx) => {
    await requirePermission(actorId, "edit_pages", tx);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(71420394)`;
    const existing = await tx.page.findUnique({
      where: { id: "roofing" },
      include: { sections: true },
    });
    if (existing) {
      if (existing.deletedAt) throw new AppError(409, "Roofing is archived.");
      return existing;
    }
    const source = await tx.page.findUnique({ where: { id: "homepage" } });
    if (!source || source.deletedAt)
      throw new AppError(404, "Shared homepage not found");
    const shared = snapshotSchema.parse(source.draftSnapshot);
    const contact = String(
      resolveHomepage(shared.homepage).footer.ctaHref || "#contact",
    );
    const snapshot = snapshotSchema.parse({
      title: "Roofing",
      sections: [],
      industryDetail: defaultRoofing(source.localeId, source.marketId, contact),
    });
    await assertPageSnapshot(
      tx,
      { id: "roofing", localeId: source.localeId, marketId: source.marketId },
      snapshot,
    );
    await assertMediaReferences(tx, snapshot);
    const page = await tx.page.create({
      data: {
        id: "roofing",
        slug: "industries/roofing",
        title: snapshot.title,
        localeId: source.localeId,
        marketId: source.marketId,
        status: "DRAFT",
        draftSnapshot: snapshot as Prisma.InputJsonValue,
        createdBy: actorId,
        updatedBy: actorId,
      },
      include: { sections: true },
    });
    await tx.auditLog.create({
      data: {
        actorId: actorId!,
        action: "page.draft_initialized",
        entityType: "Page",
        entityId: page.id,
        after: snapshot as Prisma.InputJsonValue,
      },
    });
    return page;
  });
}

export async function initializeIndustries(actorId: string | null) {
  await requirePermission(actorId, "edit_pages");
  return db.$transaction(async (tx) => {
    await requirePermission(actorId, "edit_pages", tx);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(71420393)`;
    const existing = await tx.page.findUnique({
      where: { id: "industries" },
      include: { sections: true },
    });
    if (existing) {
      if (existing.deletedAt)
        throw new AppError(409, "Industries is archived.");
      return existing;
    }
    const source = await tx.page.findUnique({ where: { id: "homepage" } });
    if (!source || source.deletedAt)
      throw new AppError(404, "Shared homepage not found");
    const snapshot = snapshotSchema.parse({
      title: "Industries",
      sections: [],
      industriesPage: defaultIndustries(source.localeId, source.marketId),
    });
    await assertPageSnapshot(
      tx,
      {
        id: "industries",
        localeId: source.localeId,
        marketId: source.marketId,
      },
      snapshot,
    );
    await assertMediaReferences(tx, snapshot);
    const page = await tx.page.create({
      data: {
        id: "industries",
        slug: "industries",
        title: snapshot.title,
        localeId: source.localeId,
        marketId: source.marketId,
        status: "DRAFT",
        draftSnapshot: snapshot as Prisma.InputJsonValue,
        createdBy: actorId,
        updatedBy: actorId,
      },
      include: { sections: true },
    });
    await tx.auditLog.create({
      data: {
        actorId: actorId!,
        action: "page.draft_initialized",
        entityType: "Page",
        entityId: page.id,
        after: snapshot as Prisma.InputJsonValue,
      },
    });
    return page;
  });
}

export async function initializeAbout(actorId: string | null) {
  await requirePermission(actorId, "edit_pages");
  return db.$transaction(async (tx) => {
    await requirePermission(actorId, "edit_pages", tx);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(71420392)`;
    const existing = await tx.page.findUnique({
      where: { id: "about" },
      include: { sections: true },
    });
    if (existing) {
      if (existing.deletedAt) throw new AppError(409, "About is archived.");
      return existing;
    }
    const source = await tx.page.findUnique({ where: { id: "homepage" } });
    if (!source || source.deletedAt)
      throw new AppError(404, "Shared homepage not found");
    const snapshot = snapshotSchema.parse({
      title: "About",
      sections: [],
      about: defaultAbout(source.localeId, source.marketId),
    });
    await assertPageSnapshot(
      tx,
      { id: "about", localeId: source.localeId, marketId: source.marketId },
      snapshot,
    );
    await assertMediaReferences(tx, snapshot);
    const page = await tx.page.create({
      data: {
        id: "about",
        slug: "about",
        title: snapshot.title,
        localeId: source.localeId,
        marketId: source.marketId,
        status: "DRAFT",
        draftSnapshot: snapshot as Prisma.InputJsonValue,
        createdBy: actorId,
        updatedBy: actorId,
      },
      include: { sections: true },
    });
    await tx.auditLog.create({
      data: {
        actorId: actorId!,
        action: "page.draft_initialized",
        entityType: "Page",
        entityId: page.id,
        after: snapshot as Prisma.InputJsonValue,
      },
    });
    return page;
  });
}

async function mutate(
  actorId: string | null,
  pageId: string,
  expectedVersion: number,
  resolve: (tx: Prisma.TransactionClient) => Promise<Snapshot>,
  action: string,
) {
  try {
    return await db.$transaction(
      async (tx) => {
        await requirePermission(actorId, "edit_pages", tx);
        // Lock before reading the prior snapshot: concurrent editors cannot overwrite each other.
        await tx.$queryRaw`SELECT id FROM "Page" WHERE id=${pageId} FOR UPDATE`;
        const current = await tx.page.findFirst({
          where: { id: pageId, deletedAt: null },
          include: { sections: { orderBy: { position: "asc" } } },
        });
        if (!current) throw new AppError(404, "Page not found");
        if (current.version !== expectedVersion)
          throw new AppError(409, "This draft changed. Reload before saving.");
        const next = snapshotSchema.parse(await resolve(tx));
        await assertPageSnapshot(tx, current, next);
        if (next.servicesPage && current.draftSnapshot) {
          const previous = snapshotSchema.parse(
            current.draftSnapshot,
          ).servicesPage;
          // The approved partner is the sole additive Services migration. Legacy
          // revisions remain restorable; all existing identities stay protected.
          const identities = (content: NonNullable<Snapshot["servicesPage"]>) =>
            content.sections.map((s) => ({
              id: s.id,
              items: s.items
                .filter(
                  (i) =>
                    !(
                      s.id === "services-strategy" &&
                      i.id === "services-strategy-partner"
                    ),
                )
                .map((i) => ({ id: i.id, list: i.list.map((l) => l.id) })),
              outcomes: s.outcomes.map((i) => i.id),
            }));
          if (
            previous &&
            !isDeepStrictEqual(
              identities(previous),
              identities(next.servicesPage),
            )
          )
            throw new AppError(
              400,
              "Services collection identities and order cannot be changed.",
            );
        }
        await assertMediaReferences(tx, next);
        if (
          next.sections.length !== current.sections.length ||
          next.sections.some(
            (s, i) =>
              s.id !== current.sections[i].id ||
              s.type !== current.sections[i].type,
          )
        )
          throw new AppError(
            400,
            "Section structure cannot be changed in this milestone.",
          );
        if (
          next.homepage &&
          (next.homepage.localeId !== current.localeId ||
            next.homepage.marketId !== current.marketId)
        )
          throw new AppError(
            400,
            "Homepage locale and market cannot be changed.",
          );
        if (
          action === "page.draft_saved" &&
          current.draftSnapshot &&
          snapshotSchema.parse(current.draftSnapshot).homepage &&
          !next.homepage
        )
          throw new AppError(
            400,
            "Complete homepage content is required for this draft.",
          );
        const before: Snapshot = current.draftSnapshot
          ? snapshotSchema.parse(current.draftSnapshot)
          : {
              title: current.title,
              sections: current.sections.map(({ id, type, heading, body }) => ({
                id,
                type: type as "positioning",
                heading,
                body,
              })),
            };
        const checkpoint = await tx.pageRevision.findFirst({
          where: { pageId, version: current.version },
        });
        // Initialization already records the immutable first draft. Reuse only that
        // exact checkpoint; never overwrite or silently accept a different snapshot.
        if (
          checkpoint &&
          !(
            current.version === 1 &&
            isIndustrySlug(pageId) &&
            pageId !== "roofing" &&
            checkpoint.reason ===
              "Private industry initialized from approved Roofing draft 5" &&
            isDeepStrictEqual(snapshotSchema.parse(checkpoint.snapshot), before)
          )
        )
          throw new AppError(409, "This draft changed. Reload before saving.");
        if (!checkpoint)
          await tx.pageRevision.create({
            data: {
              pageId,
              version: current.version,
              snapshot: before as Prisma.InputJsonValue,
              reason:
                action === "page.draft_restored"
                  ? "Before restore"
                  : "Before edit",
              actorId: actorId!,
            },
          });
        await tx.page.update({
          where: { id: pageId },
          data: {
            title: next.title,
            draftSnapshot: next as Prisma.InputJsonValue,
            version: { increment: 1 },
            updatedBy: actorId,
          },
        });
        for (const section of next.sections)
          await tx.pageSection.update({
            where: { id: section.id },
            data: { heading: section.heading, body: section.body },
          });
        await tx.auditLog.create({
          data: {
            actorId: actorId!,
            action,
            entityId: pageId,
            before: before as Prisma.InputJsonValue,
            after: next as Prisma.InputJsonValue,
          },
        });
        return tx.page.findUniqueOrThrow({
          where: { id: pageId },
          include: { sections: { orderBy: { position: "asc" } } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (isWriteConflict(error))
      throw new AppError(409, "This draft changed. Reload before saving.");
    throw error;
  }
}
export async function saveDraft(actorId: string | null, input: unknown) {
  await requirePermission(actorId, "edit_pages");
  const parsed = draftSchema.parse(input);
  return mutate(
    actorId,
    parsed.pageId,
    parsed.expectedVersion,
    async () => ({
      title: parsed.title,
      sections: parsed.sections,
      ...(parsed.homepage ? { homepage: parsed.homepage } : {}),
      ...(parsed.about ? { about: parsed.about } : {}),
      ...(parsed.industriesPage
        ? { industriesPage: parsed.industriesPage }
        : {}),
      ...(parsed.industryDetail
        ? { industryDetail: parsed.industryDetail }
        : {}),
      ...(parsed.servicesPage ? { servicesPage: parsed.servicesPage } : {}),
    }),
    "page.draft_saved",
  );
}
export async function restoreDraft(actorId: string | null, input: unknown) {
  await requirePermission(actorId, "edit_pages");
  const parsed = restoreSchema.parse(input);
  return mutate(
    actorId,
    parsed.pageId,
    parsed.expectedVersion,
    async (tx) => {
      const revision = await tx.pageRevision.findFirst({
        where: { id: parsed.revisionId, pageId: parsed.pageId },
      });
      if (!revision) throw new AppError(404, "Revision not found");
      return snapshotSchema.parse(revision.snapshot);
    },
    "page.draft_restored",
  );
}
