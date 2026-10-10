import type { SeoText } from "@/schemas/seo-text";

export type SeoCheck = { label: string; passed: boolean };
export function assessSeo(
  seo: Partial<SeoText> | undefined,
  path: string,
  text: string,
) {
  const focus = seo?.focusPhrase?.trim().toLocaleLowerCase() ?? "";
  const checks: SeoCheck[] = [
    { label: "SEO title is present", passed: !!seo?.title?.trim() },
    {
      label: "SEO title is within 60 characters",
      passed: !!seo?.title?.trim() && seo.title.length <= 60,
    },
    { label: "Description is present", passed: !!seo?.description?.trim() },
    {
      label: "Description is within 160 characters",
      passed: !!seo?.description?.trim() && seo.description.length <= 160,
    },
    {
      label: "Canonical matches the page route",
      passed: !seo?.canonicalPath || seo.canonicalPath === path,
    },
    { label: "Focus phrase is set", passed: !!focus },
    {
      label: "Focus phrase appears in title",
      passed: !!focus && !!seo?.title?.toLocaleLowerCase().includes(focus),
    },
    {
      label: "Focus phrase appears in description",
      passed:
        !!focus && !!seo?.description?.toLocaleLowerCase().includes(focus),
    },
    {
      label: "Social sharing image is selected",
      passed: !!seo?.socialImage?.mediaId,
    },
  ];
  const contentChecks: SeoCheck[] = [
    { label: "Page copy is present", passed: !!text.trim() },
    {
      label: "Focus phrase appears in page copy",
      passed: !!focus && text.toLocaleLowerCase().includes(focus),
    },
    { label: "Social title is supplied", passed: !!seo?.socialTitle?.trim() },
    {
      label: "Social description is supplied",
      passed: !!seo?.socialDescription?.trim(),
    },
  ];
  const score = (items: SeoCheck[]) =>
    Math.round((items.filter((c) => c.passed).length / items.length) * 100);
  return {
    score: score(checks),
    contentScore: score(contentChecks),
    checks,
    contentChecks,
  };
}
/** Collect only editorial values; identities, URLs and implementation configuration are excluded. */
export function editorialText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  if (Array.isArray(value)) return value.map(editorialText).join(" ");
  return Object.entries(value)
    .map(([key, item]) => {
      if (
        ["seo", "controls", "media", "image", "images", "socialImage"].includes(
          key,
        )
      )
        return "";
      if (typeof item === "string")
        return /^(title|heading|body|copy|description|label|value|text|answer|question|excerpt|subtitle)$/.test(
          key,
        )
          ? item
          : "";
      return editorialText(item);
    })
    .join(" ");
}
