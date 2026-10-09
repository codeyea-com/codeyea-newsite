import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
import { test, expect } from "@playwright/test";
import { services, industries } from "../src/schemas/content";
test("homepage design preserves section structure and works across review widths", async ({
  page,
}) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const sections = [
    "top",
    "positioning",
    "services",
    "about",
    "service-flow",
    "hosting",
    "work",
    "industries",
  ];
  const positions = await Promise.all(
    sections.map((id) =>
      page
        .locator("#" + id)
        .evaluate((el) => el.getBoundingClientRect().top + window.scrollY),
    ),
  );
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  await expect(page.locator(".hp-clients > img")).toHaveCount(6);
  await expect(page.locator(".hp-flow-panel")).toHaveCount(3);
  await expect(page.locator(".hp-accordions details")).toHaveCount(5);
  for (const title of services)
    await expect(
      page
        .locator("#services")
        .getByRole("heading", { name: title, exact: true }),
    ).toHaveCount(1);
  for (const title of industries)
    await expect(
      page
        .locator("#industry-list")
        .getByRole("heading", { name: title, exact: true }),
    ).toHaveCount(1);
  for (const width of [320, 375, 768, 1024, 1366, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    const columns = await page
      .locator("#services")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );
    expect(columns).toBe(width < 1200 ? 2 : 4);
    if (width === 375 || width === 1440)
      await page.screenshot({
        path: "docs/screenshots/homepage-" + width + ".png",
        fullPage: true,
      });
  }
  await page.setViewportSize({ width: 812, height: 375 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".hp-hero")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.setViewportSize({ width: 375, height: 900 });
  const menu = page.locator(".hp-mobile-trigger");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const accordion = page.locator(".hp-accordions details").nth(1);
  await accordion.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(accordion).toHaveAttribute("open", "");
  await expect(
    page.locator(".hp-accordions details").first(),
  ).not.toHaveAttribute("open", "");
  await page.getByRole("button", {name:"Annually",exact:true}).click();
  await expect(page.locator(".hp-plan-table")).toContainText("$135");
  await expect(page.locator(".hp-plan-table")).toContainText("TBC");
  await page.getByRole("button", {name:"Monthly",exact:true}).click();
  await expect(page.locator(".hp-plan-table")).toContainText("$14");
  await page.getByRole("button", {name:"Branding",exact:true}).click();
  await expect(page.locator(".hp-carousel--project .hp-carousel-slide")).toHaveCount(1);
  await page.getByRole("button", {name:"All",exact:true}).click();
  await expect(page.locator(".hp-carousel--project .hp-carousel-slide")).toHaveCount(3);
  const industryNext = page.getByRole("button",{name:"Next Industries slide",exact:true});
  await expect(industryNext).toBeEnabled();
  await industryNext.click();
  await expect(page.locator(".hp-carousel--industry .hp-carousel-count")).toContainText("02");
  await page.getByRole("button",{name:"Pause Industries autoplay",exact:true}).click();
  await expect(page.getByRole("button",{name:"Resume Industries autoplay",exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});
