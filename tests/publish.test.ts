import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../src/server/db";
import { publishDraft } from "../src/server/publishing";
import { saveDraft } from "../src/server/content";
const key = randomUUID(),
  publisher = "publisher-" + key,
  editor = "editor-" + key,
  pageId = "publish-" + key;
const initial = {
  title: "Publication fixture",
  sections: [
    {
      id: "section-" + key,
      type: "positioning" as const,
      heading: "Original public copy",
      body: "Test only",
    },
  ],
};
const changed = {
  ...initial,
  sections: [{ ...initial.sections[0], heading: "Saved unpublished copy" }],
};
const request = (expectedVersion: number) => ({ pageId, expectedVersion });
before(async () => {
  await db.user.create({
    data: {
      id: publisher,
      name: "Publish tester",
      email: publisher + "@example.test",
      roles: { create: { roleId: "administrator" } },
    },
  });
  await db.user.create({
    data: {
      id: editor,
      name: "Editor tester",
      email: editor + "@example.test",
      roles: { create: { roleId: "editor" } },
    },
  });
  await db.page.create({
    data: {
      id: pageId,
      slug: pageId,
      title: initial.title,
      localeId: "en",
      marketId: "global",
      publishedSnapshot: initial,
      publishedAt: new Date("2026-01-01"),
      status: "PUBLISHED",
      sections: { create: { ...initial.sections[0], position: 0 } },
    },
  });
});
after(async () => {
  await db.auditLog.deleteMany({ where: { entityId: pageId } });
  await db.page.deleteMany({ where: { id: pageId } });
  await db.user.deleteMany({ where: { id: { in: [publisher, editor] } } });
  await db.$disconnect();
});
test("publishing requires publish_pages and rejects unexpected client content", async () => {
  await assert.rejects(() => publishDraft(null, request(1)), /Unauthorized/);
  await assert.rejects(() => publishDraft(editor, request(1)), /Forbidden/);
  await assert.rejects(() =>
    publishDraft(publisher, { ...request(1), title: "Unsaved injected copy" }),
  );
  assert.equal(await db.pagePublication.count({ where: { pageId } }), 0);
});
test("save stays private; publish archives prior publication and commits saved content with attribution", async () => {
  await saveDraft(publisher, { ...changed, pageId, expectedVersion: 1 });
  const before = await db.page.findUniqueOrThrow({ where: { id: pageId } });
  assert.deepEqual(before.publishedSnapshot, initial);
  await publishDraft(publisher, request(2));
  const page = await db.page.findUniqueOrThrow({ where: { id: pageId } });
  assert.deepEqual(page.publishedSnapshot, changed);
  assert.equal(page.status, "PUBLISHED");
  assert.equal(page.version, 3);
  assert.ok(page.publishedAt! > before.publishedAt!);
  const history = await db.pagePublication.findFirstOrThrow({
    where: { pageId },
  });
  assert.deepEqual(history.previousSnapshot, initial);
  assert.deepEqual(history.snapshot, changed);
  assert.equal(history.actorId, publisher);
  assert.deepEqual(history.previousPublishedAt, before.publishedAt);
  assert.deepEqual(history.publishedAt, page.publishedAt);
  assert.equal(history.version, 2);
  const audit = await db.auditLog.findFirstOrThrow({
    where: { entityId: pageId, action: "page.published" },
  });
  assert.equal(audit.actorId, publisher);
  assert.equal(audit.actorKind, "USER");
  assert.deepEqual(audit.before, initial);
  assert.deepEqual(audit.after, changed);
});
test("stale publish and duplicate publish create no partial records", async () => {
  await assert.rejects(() => publishDraft(publisher, request(2)), /changed/);
  await assert.rejects(
    () => publishDraft(publisher, request(3)),
    /already published/,
  );
  assert.equal(await db.pagePublication.count({ where: { pageId } }), 1);
});
test("invalid saved draft cannot be published", async () => {
  await db.pageSection.update({
    where: { id: initial.sections[0].id },
    data: { heading: "" },
  });
  try {
    await assert.rejects(() => publishDraft(publisher, request(3)));
  } finally {
    await db.pageSection.update({
      where: { id: initial.sections[0].id },
      data: { heading: changed.sections[0].heading },
    });
  }
  assert.equal(await db.pagePublication.count({ where: { pageId } }), 1);
});
test("audit failure rolls back publication, timestamp, version and publication history", async () => {
  await saveDraft(publisher, { ...initial, pageId, expectedVersion: 3 });
  const before = await db.page.findUniqueOrThrow({ where: { id: pageId } });
  const constraint = "publish_failure_" + key.replaceAll("-", "");
  await db.$executeRawUnsafe(
    `ALTER TABLE "AuditLog" ADD CONSTRAINT "${constraint}" CHECK ("entityId" <> '${pageId}' OR action <> 'page.published') NOT VALID`,
  );
  try {
    await assert.rejects(() => publishDraft(publisher, request(4)));
  } finally {
    await db.$executeRawUnsafe(
      `ALTER TABLE "AuditLog" DROP CONSTRAINT "${constraint}"`,
    );
  }
  assert.deepEqual(
    await db.page.findUniqueOrThrow({ where: { id: pageId } }),
    before,
  );
  assert.equal(await db.pagePublication.count({ where: { pageId } }), 1);
});
test("concurrent publishes have one winner and one conflict", async () => {
  const results = await Promise.allSettled([
    publishDraft(publisher, request(4)),
    publishDraft(publisher, request(4)),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  const rejected = results.find((r) => r.status === "rejected");
  assert.match(String(rejected?.reason), /changed/);
  assert.equal(await db.pagePublication.count({ where: { pageId } }), 2);
});

test("first publication preserves null previous state", async () => {
  const freshId = pageId + "-first";
  const fresh = {
    ...initial,
    sections: [
      { ...initial.sections[0], id: initial.sections[0].id + "-first" },
    ],
  };
  await db.page.create({
    data: {
      id: freshId,
      slug: freshId,
      title: fresh.title,
      localeId: "en",
      marketId: "global",
      sections: { create: { ...fresh.sections[0], position: 0 } },
    },
  });
  try {
    await publishDraft(publisher, { pageId: freshId, expectedVersion: 1 });
    const history = await db.pagePublication.findFirstOrThrow({
      where: { pageId: freshId },
    });
    assert.equal(history.previousSnapshot, null);
    assert.equal(history.previousPublishedAt, null);
    assert.deepEqual(history.snapshot, fresh);
  } finally {
    await db.auditLog.deleteMany({ where: { entityId: freshId } });
    await db.page.delete({ where: { id: freshId } });
  }
});
test("save racing publish cannot publish unseen newer edits", async () => {
  await saveDraft(publisher, { ...changed, pageId, expectedVersion: 5 });
  const results = await Promise.allSettled([
    publishDraft(publisher, request(6)),
    saveDraft(publisher, { ...initial, pageId, expectedVersion: 6 }),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.match(
    String(results.find((r) => r.status === "rejected")?.reason),
    /changed/,
  );
  const page = await db.page.findUniqueOrThrow({ where: { id: pageId } });
  assert.equal(page.version, 7);
  assert.deepEqual(
    page.publishedSnapshot,
    results[0].status === "fulfilled" ? changed : initial,
  );
});
