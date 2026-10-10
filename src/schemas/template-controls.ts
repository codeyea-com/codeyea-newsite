import { z } from "zod";
import { safeHref } from "./contract-primitives";
import { homepageAssets } from "@/content/homepage-assets";
const key = z.string().min(1).max(100);
const link = safeHref.or(
  z
    .string()
    .max(2048)
    .regex(
      /^(mailto:[^\s<>"\\]+|tel:\+?[0-9 ()-]+|#|[a-zA-Z0-9_./-]+\.html(?:#[a-zA-Z0-9_-]+)?)$/,
    ),
);
const imageId = z
  .string()
  .max(100)
  .refine(
    (value) =>
      value === "" ||
      homepageAssets.some((asset) => asset.id === value) ||
      /^media_[0-9a-f-]{36}$/.test(value),
    "Choose a registered library image",
  );
export const templateControlsSchema = z
  .object({
    sections: z
      .array(
        z
          .object({ key, label: z.string().max(200), enabled: z.boolean() })
          .strict(),
      )
      .max(200),
    links: z
      .array(z.object({ key, label: z.string().max(200), href: link }).strict())
      .max(500),
    assets: z
      .array(
        z
          .object({
            key,
            label: z.string().max(200),
            source: z.string().max(2000),
            mediaId: imageId,
            alt: z.string().max(300).optional(),
            decorative: z.boolean().optional(),
          })
          .strict(),
      )
      .max(500),
    artworkText: z
      .array(
        z
          .object({
            key,
            label: z.string().max(200),
            value: z.string().max(5000),
          })
          .strict(),
      )
      .max(1000)
      .refine(
        (items) =>
          items.every(
            (item) =>
              !item.key.startsWith("data-number-") ||
              /^\d+(?:\.\d{1,2})?$/.test(item.value),
          ),
        "Product prices must be non-negative numbers with at most two decimals",
      ),
  })
  .strict();
export type TemplateControls = z.infer<typeof templateControlsSchema>;
