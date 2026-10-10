import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../src/server/db";
import { saveSiteDraft, restoreSiteDraft } from "../src/server/site-editing";
import {
  templateContent,
  templatePageDraft,
  bindDocumentControls,
} from "../src/server/site-documents";
import { homepageAssets } from "../src/content/homepage-assets";
const suffix = randomUUID(),
  user = "coverage-user-" + suffix,
  role = "coverage-role-" + suffix,
  id = "coverage-page-" + suffix,
  post = "coverage-post-" + suffix;
const html = await templateContent("web-mobile-apps"),
  original = await bindDocumentControls(
    "web-mobile-apps",
    html,
    templatePageDraft("web-mobile-apps", html).content,
  );
before(async () => {
  await db.role.create({
    data: {
      id: role,
      name: role,
      permissions: {
        create: [
          { permissionId: "edit_pages" },
          { permissionId: "edit_posts" },
        ],
      },
    },
  });
  await db.user.create({
    data: {
      id: user,
      name: "Coverage editor",
      email: user + "@example.test",
      roles: { create: { roleId: role } },
    },
  });
  await db.siteDocument.create({
    data: {
      id,
      slug: id,
      title: "Coverage",
      template: "web-mobile-apps",
      draft: original as never,
    },
  });
  await db.siteDocument.create({
    data: {
      id: post,
      slug: post,
      title: "Article",
      kind: "post",
      draft: {
        fields: [],
        description: "Article",
        body: "Private original article",
      },
    },
  });
});
test("template section, link, image and generated copy changes save privately and restore together", async () => {
  const draft = structuredClone(original);
  assert.ok(draft.controls);
  draft.controls.sections[0].enabled = false;
  draft.controls.links[0].href = "/contact/";
  draft.controls.assets[0].mediaId = homepageAssets[0].id;
  draft.controls.artworkText[0].value = "Private artwork copy";
  await saveSiteDraft(user, { id, version: 1, title: "Coverage", draft });
  const saved = await db.siteDocument.findUniqueOrThrow({ where: { id } });
  assert.equal(saved.published, null);
  assert.deepEqual((saved.draft as typeof draft).controls, draft.controls);
  await assert.rejects(() =>
    saveSiteDraft(user, { id, version: 1, title: "Stale", draft }),
  );
  const revision = await db.siteDocumentRevision.findUniqueOrThrow({
    where: { documentId_version: { documentId: id, version: 1 } },
  });
  await restoreSiteDraft(user, { id, version: 2, revisionId: revision.id });
  const restored = await db.siteDocument.findUniqueOrThrow({ where: { id } });
  assert.deepEqual(restored.draft, original);
  assert.equal(restored.published, null);
});
test("future blog metadata and SEO save in revisions without creating a public article", async () => {
  const draft = {
    fields: [],
    description: "Private article description",
    body: "Private edited article",
    tags: ["Agency"],
    blog: {
      author: "Editor",
      excerpt: "Private summary",
      categories: ["News"],
      coverImage: {
        mediaId: homepageAssets[0].id,
        alt: "Article cover",
        decorative: false,
      },
    },
    seo: {
      title: "Article | CODEYEA",
      description: "Private article description",
      canonicalPath: "/blog/" + post + "/",
      index: false,
      follow: true,
    },
  };
  await saveSiteDraft(user, { id: post, version: 1, title: "Article", draft });
  const saved = await db.siteDocument.findUniqueOrThrow({
    where: { id: post },
  });
  assert.equal(saved.published, null);
  assert.deepEqual((saved.draft as typeof draft).blog, draft.blog);
  await assert.rejects(() =>
    saveSiteDraft(user, {
      id: post,
      version: 2,
      title: "Article",
      draft: { ...draft, seo: { ...draft.seo, canonicalPath: "/contact/" } },
    }),
  );
  const revision = await db.siteDocumentRevision.findUniqueOrThrow({
    where: { documentId_version: { documentId: post, version: 1 } },
  });
  await restoreSiteDraft(user, {
    id: post,
    version: 2,
    revisionId: revision.id,
  });
  const restored = await db.siteDocument.findUniqueOrThrow({
    where: { id: post },
  });
  assert.equal(
    (restored.draft as { body: string }).body,
    "Private original article",
  );
  assert.equal(restored.published, null);
});
after(async () => {
  await db.auditLog.deleteMany({ where: { actorId: user } });
  await db.siteDocumentRevision.deleteMany({
    where: { documentId: { in: [id, post] } },
  });
  await db.siteDocument.deleteMany({ where: { id: { in: [id, post] } } });
  await db.user.deleteMany({ where: { id: user } });
  await db.rolePermission.deleteMany({ where: { roleId: role } });
  await db.role.deleteMany({ where: { id: role } });
  await db.$disconnect();
});
