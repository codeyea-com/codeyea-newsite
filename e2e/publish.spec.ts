import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
import { test, expect } from "@playwright/test";
import { randomUUID, randomBytes } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { db } from "../src/server/db";
import { Prisma } from "../src/generated/prisma/client";
const id = "publish-browser-" + randomUUID(),
  email = id + "@example.test",
  password = randomBytes(24).toString("base64url");
let original: Awaited<ReturnType<typeof db.page.findUniqueOrThrow>>;
let originalSections: { id: string; heading: string; body: string }[];
test.beforeAll(async () => {
  await db.rateLimit.deleteMany();
  original = await db.page.findUniqueOrThrow({ where: { id: "homepage" } });
  originalSections = await db.pageSection.findMany({
    where: { pageId: "homepage" },
    select: { id: true, heading: true, body: true },
  });
  await db.user.create({
    data: {
      id,
      name: "Isolated publish reviewer",
      email,
      emailVerified: true,
      roles: { create: { roleId: "administrator" } },
      accounts: {
        create: {
          id: randomUUID(),
          providerId: "credential",
          accountId: id,
          password: await hashPassword(password),
        },
      },
    },
  });
});
test.afterAll(async () => {
  if (original)
    await db.$transaction(async (tx) => {
      await tx.page.update({
        where: { id: "homepage" },
        data: {
          title: original.title,
          status: original.status,
          draftSnapshot: original.draftSnapshot ?? Prisma.DbNull,
          publishedSnapshot: original.publishedSnapshot ?? Prisma.DbNull,
          publishedAt: original.publishedAt,
          version: original.version,
          updatedBy: original.updatedBy,
          scheduledAt: original.scheduledAt,
          updatedAt: original.updatedAt,
        },
      });
      for (const s of originalSections)
        await tx.pageSection.update({
          where: { id: s.id },
          data: { heading: s.heading, body: s.body },
        });
    });
  await db.auditLog.deleteMany({ where: { actorId: id } });
  await db.pageRevision.deleteMany({ where: { actorId: id } });
  await db.pagePublication.deleteMany({ where: { actorId: id } });
  await db.user.deleteMany({ where: { id } });
  await db.$disconnect();
});
test("authorized publish requires saved edits, rejects unsafe requests and changes only isolated public content", async ({
  page,
  request,
}) => {
  test.setTimeout(60000);
  const origin = process.env.BETTER_AUTH_URL!;
  expect(
    (
      await request.post("/api/cms/publish", {
        headers: { Origin: origin },
        data: { pageId: "homepage", expectedVersion: 1 },
      })
    ).status(),
  ).toBe(401);
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const publish = page.getByRole("button", { name: "Publish", exact: true });
  await expect(publish).toBeVisible();
  const before = await (await request.get("/api/public-page")).json();
  const heading = "Isolated publication " + id;
  await page.getByLabel("Heading", { exact: true }).fill(heading);
  await expect(publish).toBeDisabled();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Draft saved with unpublished changes.",
  );
  await expect(publish).toBeEnabled();
  const state = await (await page.request.get("/api/cms")).json();
  const payload = { pageId: "homepage", expectedVersion: state.page.version };
  expect(state.page.hasUnpublishedChanges).toBe(true);
  expect(await (await request.get("/api/public-page")).json()).toEqual(before);
  for (const invalidOrigin of [undefined, "https://untrusted.example"]) {
    expect(
      (
        await page.request.post("/api/cms/publish", {
          headers: invalidOrigin ? { Origin: invalidOrigin } : {},
          data: payload,
        })
      ).status(),
    ).toBe(403);
  }
  expect(
    (
      await page.request.post("/api/cms/publish", {
        headers: { Origin: origin },
        data: { ...payload, expectedVersion: payload.expectedVersion - 1 },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await page.request.post("/api/cms/publish", {
        headers: { Origin: origin },
        data: { ...payload, sections: [] },
      })
    ).status(),
  ).toBe(400);
  const publicPage = await page.context().newPage();
  await publicPage.goto("/");
  await expect(
    publicPage.getByRole("heading", { name: heading, exact: true }),
  ).toHaveCount(0);
  await publish.click();
  await expect(page.getByRole("status")).toHaveText(
    "Published. The public page now shows this saved draft.",
  );
  await expect(publish).toBeDisabled();
  const published = await (await request.get("/api/public-page")).json();
  expect(published.sections[0].heading).toBe(heading);
  await publicPage.reload();
  await expect(
    publicPage.getByRole("heading", { name: heading, exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".page-heading > .status-pill")).toContainText(
    "Published",
  );
  for (const width of [320, 375, 768, 1024, 1366, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.screenshot({
    path: "docs/screenshots/cms-published.png",
    fullPage: true,
  });
  await page
    .getByLabel("Heading", { exact: true })
    .fill(heading + " next draft");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Draft saved with unpublished changes.",
  );
  expect(await (await request.get("/api/public-page")).json()).toEqual(
    published,
  );
  // Revoke only publishing, retaining valid authenticated CMS access.
  await db.userRole.deleteMany({ where: { userId: id } });
  await db.userRole.create({ data: { userId: id, roleId: "editor" } });
  const latest = await (await page.request.get("/api/cms")).json();
  expect(
    (
      await page.request.post("/api/cms/publish", {
        headers: { Origin: origin },
        data: { pageId: "homepage", expectedVersion: latest.page.version },
      })
    ).status(),
  ).toBe(403);
  await page.reload();
  await expect(publish).toHaveCount(0);
  await publicPage.close();
});
