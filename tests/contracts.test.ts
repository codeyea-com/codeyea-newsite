import { test } from "node:test";
import assert from "node:assert/strict";
import {
  homepageSnapshotV1,
  readHomepageSnapshot,
} from "../src/schemas/homepage-contracts";
import {
  serviceContract,
  industryContract,
  menuContract,
} from "../src/schemas/collection-contracts";
import { safeHref, mediaRef } from "../src/schemas/contract-primitives";
const legacy = {
  title: "Homepage",
  sections: [
    {
      id: "positioning",
      type: "positioning",
      heading: "CODEYEA",
      body: "Digital Innovation Agency",
    },
  ],
};
const context = { id: "homepage", localeId: "en", marketId: "global" };
const record = {
  ...context,
  position: 0,
  enabled: true,
  slug: "web-app",
  description: "",
};
test("legacy upgrade is pure, versioned, deeply immutable and preserves copy", () => {
  const before = structuredClone(legacy);
  const result = readHomepageSnapshot(legacy, context);
  assert.deepEqual(legacy, before);
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.sections[0].type, "positioning");
  if (result.sections[0].type === "positioning")
    assert.equal(result.sections[0].heading, "CODEYEA");
  assert.ok(Object.isFrozen(result.sections[0]));
  assert.deepEqual(readHomepageSnapshot(result, context), result);
});
test("unknown versions and unsafe structural additions fail closed", () => {
  const value = readHomepageSnapshot(legacy, context);
  assert.equal(
    homepageSnapshotV1.safeParse({ ...value, schemaVersion: 2 }).success,
    false,
  );
  assert.throws(() =>
    readHomepageSnapshot({ ...value, schemaVersion: 2 }, context),
  );
  assert.equal(
    homepageSnapshotV1.safeParse({
      ...value,
      sections: [...value.sections, ...value.sections],
    }).success,
    false,
  );
  assert.equal(
    homepageSnapshotV1.safeParse({ ...value, script: "alert(1)" }).success,
    false,
  );
});
test("approved taxonomy, safe links, and media alternatives are enforced", () => {
  assert.equal(
    serviceContract.safeParse({
      ...record,
      kind: "service",
      title: "AI & Automation",
    }).success,
    true,
  );
  assert.equal(
    serviceContract.safeParse({
      ...record,
      kind: "service",
      title: "WordPress Technical Support",
    }).success,
    false,
  );
  assert.equal(
    industryContract.safeParse({ ...record, kind: "industry", title: "Legal" })
      .success,
    true,
  );
  for (const href of ["javascript:alert(1)", "//evil.test", "/\\evil.test"])
    assert.equal(safeHref.safeParse(href).success, false);
  assert.equal(
    mediaRef.safeParse({ mediaId: "photo", alt: "", decorative: false })
      .success,
    false,
  );
});
test("menu trees reject self references and missing parents", () => {
  const item = {
    id: "a",
    parentId: "a",
    position: 0,
    enabled: true,
    action: { label: "Home", href: "/" },
  };
  assert.equal(
    menuContract.safeParse({
      ...context,
      kind: "menu",
      title: "Main",
      position: 0,
      enabled: true,
      items: [item],
    }).success,
    false,
  );
});

test("external checkout boundaries and immutable revision attribution are validated", async () => {
  const { externalHttps } = await import("../src/schemas/contract-primitives");
  const { pageRevisionEnvelope, marketDefinition } =
    await import("../src/schemas/revision-contracts");
  for (const url of [
    "/checkout",
    "mailto:owner@example.com",
    "http://example.com",
    "https://user:secret@example.com",
  ])
    assert.equal(externalHttps.safeParse(url).success, false);
  assert.equal(
    externalHttps.safeParse("https://example.com/checkout").success,
    true,
  );
  const revision = {
    id: "rev1",
    entityId: "homepage",
    actorId: "editor",
    version: 1,
    createdAt: "2026-09-11T00:00:00Z",
    reason: "Before edit",
    schemaVersion: 1,
    kind: "pageRevision",
    snapshot: readHomepageSnapshot(legacy, context),
  };
  assert.equal(pageRevisionEnvelope.safeParse(revision).success, true);
  assert.equal(
    pageRevisionEnvelope.safeParse({ ...revision, entityId: "other" }).success,
    false,
  );
  assert.equal(
    marketDefinition.safeParse({
      id: "global",
      name: "Global",
      currency: "USD",
      defaultLocaleId: "ar",
      localeIds: ["en"],
      enabled: true,
      position: 0,
    }).success,
    false,
  );
});
