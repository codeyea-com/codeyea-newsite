import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
import { test, expect } from "@playwright/test";
import { randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { db } from "../src/server/db";
import { mkdirSync } from "node:fs";
const id = randomUUID(),
  email = `review-${id}@example.test`,
  password = randomBytes(24).toString("base64url");
let originalVersion: number, originalHeading: string;
test.beforeAll(async () => {
  await db.user.create({
    data: {
      id,
      name: "Browser reviewer",
      email,
      emailVerified: true,
      accounts: {
        create: {
          id: randomUUID(),
          providerId: "credential",
          accountId: id,
          password: await hashPassword(password),
        },
      },
      roles: { create: { roleId: "editor" } },
    },
  });
  const homepage = await db.page.findUniqueOrThrow({
    where: { id: "homepage" },
    include: { sections: { orderBy: { position: "asc" } } },
  });
  const snapshot = {
    title: homepage.title,
    sections: homepage.sections.map(({ id, type, heading, body }) => ({
      id,
      type,
      heading,
      body,
    })),
  };
  await db.pageRevision.createMany({
    data: Array.from({ length: 51 }, (_, i) => ({
      pageId: "homepage",
      version: homepage.version + i,
      snapshot,
      reason: "Isolated pagination fixture",
      actorId: id,
    })),
  });
  await db.page.update({
    where: { id: "homepage" },
    data: { version: { increment: 51 } },
  });
  originalVersion = homepage.version + 51;
  originalHeading = homepage.sections[0].heading;
});
test.afterAll(async () => {
  // Keep attributable editorial records; remove only this test account's active access.
  await db.session.deleteMany({ where: { userId: id } });
  await db.account.deleteMany({ where: { userId: id } });
  await db.userRole.deleteMany({ where: { userId: id } });
  await db.$disconnect();
});
test("login, draft save/reload, public isolation, restore, audit and logout", async ({
  page,
  request,
}) => {
  expect((await request.get("/api/cms")).status()).toBe(401);
  expect(
    (await request.get("/api/cms/revisions?beforeVersion=10")).status(),
  ).toBe(401);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Shape your homepage." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish", exact: true })).toHaveCount(0);
  mkdirSync("docs/screenshots", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "docs/screenshots/cms-desktop.png",
    fullPage: true,
  });
  for (const width of [320, 375, 768, 1024, 1366, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await expect(page.getByLabel("Heading", { exact: true })).toBeVisible();
    if (width === 375)
      await page.screenshot({
        path: "docs/screenshots/cms-mobile.png",
        fullPage: true,
      });
  }
  await page.setViewportSize({ width: 812, height: 375 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const cookies = await page.context().cookies();
  expect(
    cookies.some(
      (c) =>
        c.name.includes("session_token") && c.httpOnly && c.sameSite === "Lax",
    ),
  ).toBeTruthy();
  const publishedBefore = await (await request.get("/api/public-page")).json();
  const changed = `Browser-tested draft ${id}`;
  await page.getByLabel("Heading", { exact: true }).fill(changed);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Draft saved");
  await page.reload();
  await expect(page.getByLabel("Heading", { exact: true })).toHaveValue(
    changed,
  );
  expect(await (await request.get("/api/public-page")).json()).toEqual(
    publishedBefore,
  );
  await page.getByRole("button", { name: "Revisions", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: `Restore revision ${originalVersion}`,
      exact: true,
    }),
  ).toHaveCount(0);
  const firstHistory = await (await page.request.get("/api/cms")).json();
  expect(firstHistory.revisions).toHaveLength(50);
  expect(
    (
      await page.request.get("/api/cms/revisions?beforeVersion=invalid")
    ).status(),
  ).toBe(400);
  const older = await (
    await page.request.get(
      `/api/cms/revisions?beforeVersion=${firstHistory.nextRevisionVersion}`,
    )
  ).json();
  expect(
    older.revisions.every(
      (r: { version: number }) => r.version < firstHistory.nextRevisionVersion,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Load older revisions", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: `Preview version ${older.revisions[0].version}`,
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: `Preview version ${originalVersion}`,
      exact: true,
    })
    .click();
  await expect(page.getByRole("table")).toContainText(changed);
  await expect(page.getByRole("table")).toContainText(originalHeading);
  await page
    .getByRole("button", {
      name: `Restore revision ${originalVersion}`,
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("restored");
  await page.getByRole("button", { name: "Content", exact: true }).click();
  await expect(page.getByLabel("Heading", { exact: true })).toHaveValue(
    originalHeading,
  );
  await page.getByRole("button", { name: "Audit log", exact: true }).click();
  await expect(page.getByRole("table")).toContainText("page draft saved");
  await expect(page.getByRole("table")).toContainText("page draft restored");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  expect((await page.request.get("/api/cms")).status()).toBe(401);
});
test("HTTP origin, payload, registration and role boundaries are enforced", async ({
  request,
}) => {
  const base = process.env.BETTER_AUTH_URL!;
  expect(
    (
      await request.patch("/api/cms", {
        data: {},
        headers: { Origin: "https://untrusted.example" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/auth/sign-in/email", {
        data: { email, password },
      })
    ).status(),
  ).toBe(403);
  const signup = await request.post("/api/auth/sign-up/email", {
    headers: { Origin: base },
    data: { email: "blocked-" + email, password, name: "Blocked signup" },
  });
  expect(signup.ok()).toBeFalsy();
  expect(
    await db.user.findUnique({ where: { email: "blocked-" + email } }),
  ).toBeNull();
  const login = await request.post("/api/auth/sign-in/email", {
    headers: { Origin: base },
    data: { email, password },
  });
  expect(login.status()).toBe(200);
  const state = await (await request.get("/api/cms")).json();
  const payload = {
    pageId: state.page.id,
    expectedVersion: state.page.version,
    title: state.page.title,
    sections: state.page.sections,
  };
  expect(
    (
      await request.patch("/api/cms", {
        headers: { Origin: base },
        data: { ...payload, css: "position:absolute" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.patch("/api/cms", {
        headers: { Origin: base },
        data: { ...payload, title: "x".repeat(262145) },
      })
    ).status(),
  ).toBe(413);
  await db.userRole.deleteMany({ where: { userId: id } });
  await db.userRole.create({ data: { userId: id, roleId: "author" } });
  expect((await request.get("/api/cms")).status()).toBe(200);
  expect(
    (
      await request.patch("/api/cms", {
        headers: { Origin: base },
        data: payload,
      })
    ).status(),
  ).toBe(403);
  const page = await db.page.findUniqueOrThrow({ where: { id: "homepage" } });
  expect(page.version).toBe(payload.expectedVersion);
  await db.session.deleteMany({ where: { userId: id } });
  expect((await request.get("/api/cms")).status()).toBe(401);
});
test("login rate limiting cannot be bypassed with a client-supplied forwarding header", async ({
  request,
}) => {
  const statuses: number[] = [];
  for (let i = 0; i < 7; i++) {
    const response = await request.post("/api/auth/sign-in/email", {
      headers: {
        Origin: process.env.BETTER_AUTH_URL!,
        "x-forwarded-for": `198.51.100.${i + 1}`,
        "x-codeyea-rate-key": `198.51.100.${i + 1}`,
      },
      data: {
        email: "missing@example.test",
        password: "InvalidDummyPassword123",
      },
    });
    statuses.push(response.status());
  }
  expect(statuses).toContain(429);
});
