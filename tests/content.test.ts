import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
import "dotenv/config";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../src/server/db";
import { saveDraft, restoreDraft } from "../src/server/content";

const suffix = randomUUID(),
  editor = "test-editor-" + suffix,
  author = "test-author-" + suffix,
  pageId = "test-page-" + suffix,
  sectionId = "test-section-" + suffix;
const initial = {
  title: "Test page",
  sections: [
    {
      id: sectionId,
      type: "positioning" as const,
      heading: "Published heading",
      body: "Published body",
    },
  ],
};
const input = (version = 1) => ({
  ...initial,
  title: "Draft title",
  pageId,
  expectedVersion: version,
  sections: [{ ...initial.sections[0], heading: "Private draft" }],
});
before(async () => {
  await db.permission.upsert({
    where: { id: "edit_pages" },
    update: {},
    create: { id: "edit_pages", description: "Edit page drafts" },
  });
  await db.role.upsert({
    where: { id: "test-editor-role" },
    update: {},
    create: {
      id: "test-editor-role",
      name: "Test editor",
      permissions: { create: { permissionId: "edit_pages" } },
    },
  });
  await db.user.create({
    data: {
      id: editor,
      name: "Test editor",
      email: editor + "@example.test",
      roles: { create: { roleId: "test-editor-role" } },
    },
  });
  await db.user.create({
    data: { id: author, name: "Test author", email: author + "@example.test" },
  });
  await db.locale.upsert({
    where: { id: "en" },
    update: {},
    create: { id: "en", name: "English" },
  });
  await db.market.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global", name: "Global" },
  });
  await db.page.create({
    data: {
      id: pageId,
      slug: pageId,
      title: initial.title,
      localeId: "en",
      marketId: "global",
      publishedSnapshot: initial,
      sections: { create: { ...initial.sections[0], position: 0 } },
    },
  });
});
after(async () => {
  await db.auditLog.deleteMany({ where: { entityId: pageId } });
  await db.page.delete({ where: { id: pageId } });
  await db.user.deleteMany({ where: { id: { in: [editor, author] } } });
  await db.$disconnect();
});
test("audit operator identity is separate from its target and enforced by the database", async () => {
  const audit = await db.auditLog.create({
    data: {
      actorKind: "OPERATOR",
      actorLabel: "Test maintenance operator",
      entityType: "Page",
      entityId: pageId,
      action: "test.maintenance",
      after: { changed: "test field" },
    },
  });
  assert.equal(audit.actorId, null);
  assert.equal(audit.entityId, pageId);
  await assert.rejects(
    db.auditLog.create({
      data: {
        actorKind: "OPERATOR",
        actorId: editor,
        actorLabel: "Invalid mixed identity",
        entityId: pageId,
        action: "test.invalid",
      },
    }),
  );
  await db.auditLog.delete({ where: { id: audit.id } });
});
test("anonymous and unauthorized actors cannot mutate drafts", async () => {
  await assert.rejects(() => saveDraft(null, input()), /Unauthorized/);
  await assert.rejects(() => saveDraft(author, input()), /Forbidden/);
  assert.equal(
    (await db.page.findUniqueOrThrow({ where: { id: pageId } })).version,
    1,
  );
});
test("validated save persists draft and atomically snapshots the previous version without publishing", async () => {
  await assert.rejects(() => saveDraft(editor, { ...input(), title: "" }));
  await saveDraft(editor, input());
  const page = await db.page.findUniqueOrThrow({
    where: { id: pageId },
    include: { sections: true },
  });
  assert.equal(page.title, "Draft title");
  assert.equal(page.version, 2);
  assert.equal(page.sections[0].heading, "Private draft");
  assert.deepEqual(page.publishedSnapshot, initial);
  const revision = await db.pageRevision.findFirstOrThrow({
    where: { pageId, version: 1 },
  });
  assert.deepEqual(revision.snapshot, initial);
  const log = await db.auditLog.findFirstOrThrow({
    where: { entityId: pageId, action: "page.draft_saved" },
  });
  assert.equal(log.actorId, editor);
  assert.deepEqual(log.before, initial);
});
test("stale saves fail without creating partial revisions or audit entries", async () => {
  await assert.rejects(() => saveDraft(editor, input(1)), /changed/);
  assert.equal(await db.pageRevision.count({ where: { pageId } }), 1);
  assert.equal(await db.auditLog.count({ where: { entityId: pageId } }), 1);
});
test("restore creates a new draft version with rollback history and never changes published content", async () => {
  const revision = await db.pageRevision.findFirstOrThrow({
    where: { pageId, version: 1 },
  });
  await assert.rejects(
    () =>
      restoreDraft(author, {
        pageId,
        revisionId: revision.id,
        expectedVersion: 2,
      }),
    /Forbidden/,
  );
  await restoreDraft(editor, {
    pageId,
    revisionId: revision.id,
    expectedVersion: 2,
  });
  const page = await db.page.findUniqueOrThrow({
    where: { id: pageId },
    include: { sections: true },
  });
  assert.equal(page.version, 3);
  assert.equal(page.sections[0].heading, "Published heading");
  assert.deepEqual(page.publishedSnapshot, initial);
  assert.equal(await db.pageRevision.count({ where: { pageId } }), 2);
  assert.equal(await db.auditLog.count({ where: { entityId: pageId } }), 2);
});
test("two concurrent saves yield exactly one new version and one conflict", async () => {
  const results = await Promise.allSettled([
    saveDraft(editor, input(3)),
    saveDraft(editor, { ...input(3), title: "Concurrent draft" }),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(results.filter((r) => r.status === "rejected").length, 1);
  const rejected = results.find((r) => r.status === "rejected");
  assert.match(String(rejected?.reason), /changed/);
  assert.equal(
    (await db.page.findUniqueOrThrow({ where: { id: pageId } })).version,
    4,
  );
  assert.equal(await db.pageRevision.count({ where: { pageId } }), 3);
  assert.equal(await db.auditLog.count({ where: { entityId: pageId } }), 3);
});
test("a database failure during audit insertion rolls back page and revision writes", async () => {
  const before = await db.page.findUniqueOrThrow({
    where: { id: pageId },
    include: { sections: true },
  });
  const constraint = "test_failure_" + suffix.replaceAll("-", "");
  // Only this randomly identified test page is affected. PostgreSQL rejects the final audit write.
  await db.$executeRawUnsafe(
    `ALTER TABLE "AuditLog" ADD CONSTRAINT "${constraint}" CHECK ("entityId" <> '${pageId}') NOT VALID`,
  );
  try {
    await assert.rejects(() => saveDraft(editor, input(4)));
  } finally {
    await db.$executeRawUnsafe(
      `ALTER TABLE "AuditLog" DROP CONSTRAINT "${constraint}"`,
    );
  }
  const after = await db.page.findUniqueOrThrow({
    where: { id: pageId },
    include: { sections: true },
  });
  assert.deepEqual(after, before);
  assert.equal(await db.pageRevision.count({ where: { pageId } }), 3);
  assert.equal(await db.auditLog.count({ where: { entityId: pageId } }), 3);
});
