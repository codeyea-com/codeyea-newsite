import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../src/server/db";
import { saveSiteDraft, restoreSiteDraft } from "../src/server/site-editing";
import {
  bindTemplate,
  extractFields,
  templateContent,
} from "../src/server/site-documents";
const suffix = randomUUID(),
  user = "site-editor-" + suffix,
  role = "site-role-" + suffix,
  id = "site-doc-" + suffix;
const html = await templateContent("contact");
const draft = bindTemplate(html, {
  fields: extractFields(html),
  description: "Original SEO",
});
before(async () => {
  await db.role.create({
    data: {
      id: role,
      name: role,
      permissions: { create: { permissionId: "edit_pages" } },
    },
  });
  await db.user.create({
    data: {
      id: user,
      email: user + "@example.test",
      name: "Test editor",
      roles: { create: { roleId: role } },
    },
  });
  await db.siteDocument.create({
    data: { id, slug: id, title: "Original", template: "contact", draft },
  });
});
test("imported page save and restore are authorized, versioned and never publish", async () => {
  const input = {
    id,
    version: 1,
    title: "Changed",
    draft: { ...draft, description: "Edited SEO" },
  };
  await assert.rejects(() => saveSiteDraft(null, input));
  await assert.rejects(() =>
    saveSiteDraft(user, { ...input, draft: { ...draft, fields: [] } }),
  );
  const initialRevision = await db.siteDocumentRevision.create({
    data: {
      documentId: id,
      version: 1,
      snapshot: { title: "Original", draft },
      actorId: user,
    },
  });
  const results = await Promise.allSettled([
    saveSiteDraft(user, input),
    saveSiteDraft(user, input),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  const saved = await db.siteDocument.findUniqueOrThrow({ where: { id } });
  assert.equal(saved.version, 2);
  assert.equal(saved.published, null);
  const revision = await db.siteDocumentRevision.findUniqueOrThrow({
    where: { documentId_version: { documentId: id, version: 1 } },
  });
  assert.equal(revision.id, initialRevision.id);
  assert.deepEqual(revision.snapshot, initialRevision.snapshot);
  await restoreSiteDraft(user, { id, version: 2, revisionId: revision.id });
  const restored = await db.siteDocument.findUniqueOrThrow({ where: { id } });
  assert.equal(restored.version, 3);
  assert.equal(restored.title, "Original");
  assert.deepEqual(restored.draft, draft);
  assert.equal(restored.published, null);
  await assert.rejects(() =>
    restoreSiteDraft(user, { id, version: 2, revisionId: revision.id }),
  );
  assert.equal(
    await db.siteDocumentRevision.count({ where: { documentId: id } }),
    2,
  );
});
after(async () => {
  await db.auditLog.deleteMany({ where: { actorId: user } });
  await db.siteDocumentRevision.deleteMany({ where: { documentId: id } });
  await db.siteDocument.deleteMany({ where: { id } });
  await db.user.deleteMany({ where: { id: user } });
  await db.rolePermission.deleteMany({ where: { roleId: role } });
  await db.role.deleteMany({ where: { id: role } });
  await db.$disconnect();
});
