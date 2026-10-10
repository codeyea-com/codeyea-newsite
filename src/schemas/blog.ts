import { z } from "zod";
import { mediaRef } from "./contract-primitives";
import { homepageAssets } from "@/content/homepage-assets";
const cover = mediaRef.refine(
  (value) =>
    homepageAssets.some((asset) => asset.id === value.mediaId) ||
    /^media_[0-9a-f-]{36}$/.test(value.mediaId),
  "Choose a library image",
);
export const blogMetadataSchema = z
  .object({
    author: z.string().trim().max(120).default(""),
    excerpt: z.string().trim().max(500).default(""),
    coverImage: cover.optional(),
    categories: z
      .array(z.string().trim().min(1).max(100))
      .max(20)
      .refine(
        (values) => new Set(values).size === values.length,
        "Categories must be unique",
      )
      .default([]),
    scheduledAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
export type BlogMetadata = z.infer<typeof blogMetadataSchema>;
export function blogIndexPath(locale = "en") {
  return locale === "ar" ? "/ar/blog/" : "/blog/";
}
export function blogPostPath(slug: string, locale = "en") {
  if (
    !["en", "ar"].includes(locale) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  )
    return null;
  return blogIndexPath(locale) + slug + "/";
}
