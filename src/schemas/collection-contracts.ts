import { z } from "zod";
import { services, industries } from "./content";
import {
  stableId,
  externalHttps,
  copy,
  heading,
  identity,
  ordered,
  mediaRef,
  safeHref,
  action,
  seo,
  uniqueIds,
} from "./contract-primitives";
const base = {
  ...ordered,
  slug: z.string().min(1).max(180),
  title: heading,
  description: copy,
  seo: seo.optional(),
};
export const serviceContract = z
  .object({
    ...base,
    kind: z.literal("service"),
    title: z.enum(services),
    image: mediaRef.optional(),
    action: action.optional(),
  })
  .strict();
export const industryContract = z
  .object({
    ...base,
    kind: z.literal("industry"),
    title: z.enum(industries),
    image: mediaRef.optional(),
    action: action.optional(),
  })
  .strict();
export const projectContract = z
  .object({
    ...base,
    kind: z.literal("project"),
    image: mediaRef,
    categoryIds: z.array(stableId).max(30),
    serviceIds: z.array(stableId).max(8),
    industryIds: z.array(stableId).max(8),
  })
  .strict();
export const hostingPlanContract = z
  .object({
    ...base,
    kind: z.literal("hostingPlan"),
    currency: z.string().regex(/^[A-Z]{3}$/),
    monthlyMinor: z.number().int().nonnegative(),
    annualMinor: z.number().int().nonnegative().nullable(),
    features: z
      .array(
        z
          .object({
            id: stableId,
            position: z.number().int().nonnegative(),
            enabled: z.boolean(),
            label: heading,
            value: z.union([z.boolean(), z.string().max(200)]),
          })
          .strict(),
      )
      .max(50)
      .refine(uniqueIds, "Duplicate feature IDs")
      .refine(
        (v) => new Set(v.map((f) => f.position)).size === v.length,
        "Duplicate feature positions",
      ),
    checkout: z
      .object({
        platform: z.enum(["WHMCS", "UPMIND", "OTHER"]),
        externalId: stableId.optional(),
        url: externalHttps,
      })
      .strict(),
  })
  .strict();
export const postContract = z
  .object({
    ...base,
    kind: z.literal("post"),
    body: copy,
    categoryIds: z.array(stableId).max(30),
    tagIds: z.array(stableId).max(50),
    image: mediaRef.optional(),
  })
  .strict();
export const categoryContract = z
  .object({ ...base, kind: z.enum(["category", "tag"]) })
  .strict();
export const mediaContract = z
  .object({
    ...identity,
    kind: z.literal("media"),
    storageKey: z.string().min(1).max(500),
    mimeType: z.enum([
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/avif",
      "video/mp4",
    ]),
    byteSize: z.number().int().positive(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string().max(300),
  })
  .strict();
export const menuContract = z
  .object({
    ...ordered,
    kind: z.literal("menu"),
    title: heading,
    items: z
      .array(
        z
          .object({
            id: stableId,
            parentId: stableId.nullable(),
            position: z.number().int().nonnegative(),
            enabled: z.boolean(),
            action,
          })
          .strict(),
      )
      .max(100)
      .refine(uniqueIds, "Duplicate menu item IDs"),
  })
  .strict()
  .refine(
    (v) =>
      v.items.every(
        (i) =>
          i.parentId === null ||
          v.items.some(
            (p) => p.id === i.parentId && p.parentId === null && p.id !== i.id,
          ),
      ),
    "Menus support roots and one nested level only",
  );
export const settingContract = z
  .object({
    ...identity,
    kind: z.literal("setting"),
    key: z.enum(["site_identity", "contact", "social", "portal"]),
    value: z
      .object({
        label: heading,
        description: copy.optional(),
        links: z.array(action).max(20),
        logo: mediaRef.optional(),
      })
      .strict(),
  })
  .strict();
export const redirectContract = z
  .object({
    ...identity,
    kind: z.literal("redirect"),
    from: z.string().regex(/^\/(?!\/)[^\\\s]*$/),
    to: safeHref,
    status: z.union([
      z.literal(301),
      z.literal(302),
      z.literal(307),
      z.literal(308),
    ]),
    enabled: z.boolean(),
  })
  .strict();
export const collectionContract = z.discriminatedUnion("kind", [
  serviceContract,
  industryContract,
  projectContract,
  hostingPlanContract,
  postContract,
  categoryContract,
  mediaContract,
  menuContract,
  settingContract,
  redirectContract,
]);
export type CollectionRecord = z.infer<typeof collectionContract>;
