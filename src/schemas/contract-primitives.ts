import { z } from "zod";
export const stableId = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);
export const copy = z.string().trim().max(5000);
export const heading = z.string().trim().min(1).max(180);
export const identity = {
  id: stableId,
  localeId: stableId,
  marketId: stableId,
};
export const ordered = {
  ...identity,
  position: z.number().int().nonnegative(),
  enabled: z.boolean(),
};
export const mediaRef = z
  .object({
    mediaId: stableId,
    alt: z.string().max(300),
    decorative: z.boolean(),
  })
  .strict()
  .refine(
    (v) => v.decorative || v.alt.trim().length > 0,
    "Meaningful media requires alt text",
  );
export const safeHref = z
  .string()
  .max(2048)
  .refine(
    (v) =>
      /^\/(?!\/)[^\\\s]*$/.test(v) ||
      /^#[a-zA-Z0-9_-]+$/.test(v) ||
      (() => {
        try {
          return new URL(v).protocol === "https:";
        } catch {
          return false;
        }
      })(),
    "Use a relative path, fragment, or HTTPS URL",
  );
export const action = z.object({ label: heading, href: safeHref }).strict();
export const seo = z
  .object({
    title: z.string().max(120),
    description: z.string().max(320),
    canonical: safeHref.optional(),
    image: mediaRef.optional(),
    noIndex: z.boolean(),
  })
  .strict();
export function uniqueIds(items: readonly { id: string }[]) {
  return new Set(items.map((v) => v.id)).size === items.length;
}
export const externalHttps = z
  .string()
  .url()
  .max(2048)
  .refine((v) => {
    try {
      const u = new URL(v);
      return u.protocol === "https:" && !u.username && !u.password;
    } catch {
      return false;
    }
  }, "External HTTPS URL without credentials required");
