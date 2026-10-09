import { z } from "zod";
import { snapshotSchema } from "./content";
import {
  stableId,
  copy,
  heading,
  ordered,
  identity,
  mediaRef,
  action,
  uniqueIds,
} from "./contract-primitives";
import { collectionContract } from "./collection-contracts";
const sectionBase = { ...ordered };
const refs = z
  .array(stableId)
  .max(100)
  .refine((v) => new Set(v).size === v.length, "Duplicate references");
export const homepageSection = z.discriminatedUnion("type", [
  z
    .object({
      ...sectionBase,
      type: z.literal("hero"),
      heading,
      words: z.array(heading).min(1).max(12),
      body: copy,
      media: z.array(mediaRef).max(10),
      action,
      caption: copy,
    })
    .strict(),
  z
    .object({
      ...sectionBase,
      type: z.literal("clientLogos"),
      logos: z
        .array(
          z
            .object({
              id: stableId,
              media: mediaRef,
              action: action.optional(),
            })
            .strict(),
        )
        .max(30)
        .refine(uniqueIds, "Duplicate logo IDs"),
    })
    .strict(),
  z
    .object({
      ...sectionBase,
      type: z.literal("positioning"),
      heading,
      body: copy,
    })
    .strict(),
  z
    .object({ ...sectionBase, type: z.literal("services"), serviceIds: refs })
    .strict(),
  z
    .object({
      ...sectionBase,
      type: z.literal("about"),
      eyebrow: heading,
      videoAction: action.optional(),
      highlightWords: z.array(heading).max(12).optional(),
      heading,
      body: copy,
      media: mediaRef.optional(),
      action,
      accordions: z
        .array(z.object({ id: stableId, heading, body: copy }).strict())
        .max(10)
        .refine(uniqueIds, "Duplicate accordion IDs"),
    })
    .strict(),
  z
    .object({
      ...sectionBase,
      type: z.literal("experience"),
      heading,
      body: copy,
      value: z.number().nonnegative(),
      label: heading,
      media: mediaRef.optional(),
      action,
    })
    .strict(),
  z
    .object({
      ...sectionBase,
      type: z.literal("serviceFlow"),
      panels: z
        .array(
          z
            .object({
              id: stableId,
              serviceId: stableId,
              eyebrow: heading.optional(),
              bullets: z
                .array(z.string().trim().min(1).max(500))
                .max(20)
                .optional(),
              heading,
              body: copy,
              media: mediaRef.optional(),
              action,
            })
            .strict(),
        )
        .max(8)
        .refine(uniqueIds, "Duplicate panel IDs"),
    })
    .strict(),
  z
    .object({
      ...sectionBase,
      type: z.literal("hosting"),
      heading,
      body: copy,
      planIds: refs,
      defaultBilling: z.enum(["monthly", "annual"]).optional(),
      discountLabel: z.string().max(100).optional(),
      featuredPlanId: stableId.optional(),
    })
    .strict(),
  z
    .object({
      ...sectionBase,
      type: z.literal("portfolio"),
      heading,
      projectIds: refs,
      categoryIds: refs,
      action,
    })
    .strict(),
  z
    .object({
      ...sectionBase,
      type: z.literal("industriesIntro"),
      heading,
      body: copy,
      action,
    })
    .strict(),
  z
    .object({
      ...sectionBase,
      type: z.literal("industriesCarousel"),
      industryIds: refs,
      caption: copy,
    })
    .strict(),
  z
    .object({
      ...sectionBase,
      type: z.literal("footer"),
      heading,
      words: z.array(heading).max(12),
      body: copy,
      action,
      menuIds: refs,
      logo: mediaRef.optional(),
      copyright: copy,
      newsletter: z
        .object({
          enabled: z.boolean(),
          label: heading,
          placeholder: z.string().max(120),
          submitLabel: heading,
          privacyAction: action.optional(),
          integrationId: stableId.optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
]);
export const homepageSnapshotV1 = z
  .object({
    schemaVersion: z.literal(1),
    ...identity,
    title: z.string().trim().min(1).max(120),
    sections: z
      .array(homepageSection)
      .min(1)
      .max(30)
      .refine(uniqueIds, "Duplicate section IDs")
      .refine(
        (v) => new Set(v.map((s) => s.position)).size === v.length,
        "Duplicate section positions",
      ),
    globals: z
      .object({
        utilityMenuId: stableId.optional(),
        primaryMenuId: stableId.optional(),
        quoteAction: action.optional(),
        logoLight: mediaRef.optional(),
        logoDark: mediaRef.optional(),
        favicon: mediaRef.optional(),
        scrollIndicator: z.boolean(),
      })
      .strict(),
    // Content records are embedded so an immutable revision never resolves against newer live collections.
    records: z
      .array(collectionContract)
      .max(500)
      .refine(uniqueIds, "Duplicate collection IDs"),
  })
  .strict();
export type HomepageSnapshot = z.infer<typeof homepageSnapshotV1>;
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
function freeze<T>(value: T): DeepReadonly<T> {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}
/** Pure migration. Does not rewrite database revisions or invent missing homepage sections. */
export function readHomepageSnapshot(
  input: unknown,
  context: { id: string; localeId: string; marketId: string },
): DeepReadonly<HomepageSnapshot> {
  if (input && typeof input === "object" && "schemaVersion" in input)
    return freeze(homepageSnapshotV1.parse(input));
  const legacy = snapshotSchema.parse(input);
  return freeze(
    homepageSnapshotV1.parse({
      schemaVersion: 1,
      ...context,
      title: legacy.title,
      sections: legacy.sections.map((s, position) => ({
        ...s,
        localeId: context.localeId,
        marketId: context.marketId,
        position,
        enabled: true,
      })),
      globals: { scrollIndicator: false },
      records: [],
    }),
  );
}
