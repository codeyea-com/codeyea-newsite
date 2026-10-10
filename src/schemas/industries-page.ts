import { z } from "zod";
import { aboutMediaSchema } from "./about";
import { stableId, uniqueIds } from "./contract-primitives";
import { seoTextSchema } from "./seo-text";
import directoryAdditions from "../content/industry-directory-additions.json";
const text = z.string().trim().min(1);
const ordered = {
  id: stableId,
  position: z.number().int().nonnegative(),
  enabled: z.boolean(),
};
const legacyIndustryItemSchema = z
  .object({
    ...ordered,
    label: text.max(60),
    title: text.max(120),
    body: text.max(2500),
    ctaLabel: text.max(160),
    destination: z
      .string()
      .max(200)
      .refine(
        (v) => v === "" || /^\/(?:ar\/)?industries\/[a-z0-9-]+\/$/.test(v),
        "Leave empty or use an industry detail path.",
      ),
    images: z.array(aboutMediaSchema).min(1).max(2),
    temporaryMedia: z.boolean(),
    highlights: z
      .array(
        z
          .object({
            id: stableId,
            title: text.max(120),
            body: z.string().trim().max(600),
          })
          .strict(),
      )
      .min(3)
      .max(6)
      .refine(uniqueIds, "Highlight IDs must be unique"),
  })
  .strict();
const legacyIndustriesPageSchema = z
  .object({
    schemaVersion: z.literal(1),
    localeId: stableId,
    marketId: stableId,
    seo: seoTextSchema.optional(),
    hero: z
      .object({
        id: z.literal("industries-hero"),
        title: text.max(120),
        media: aboutMediaSchema,
        temporaryMedia: z.boolean(),
      })
      .strict(),
    items: z
      .array(legacyIndustryItemSchema)
      .max(40)
      .refine(uniqueIds, "Industry IDs must be unique")
      .refine(
        (v) => new Set(v.map((i) => i.position)).size === v.length,
        "Industry positions must be unique",
      ),
    cta: z
      .object({
        id: z.literal("industries-cta"),
        enabled: z.boolean(),
        label: text.max(100),
        heading: text.max(180),
        body: text.max(1000),
        actionLabel: text.max(100),
      })
      .strict(),
  })
  .strict();
export const industryItemSchema = legacyIndustryItemSchema
  .omit({ images: true })
  .extend({ heading: text.max(180), media: aboutMediaSchema })
  .strict();
export const industriesIntroductionSchema = z
  .object({
    id: z.literal("industries-introduction"),
    enabled: z.boolean(),
    label: text.max(80),
    heading: text.max(200),
    paragraphs: z
      .array(z.object({ id: stableId, body: text.max(1600) }).strict())
      .length(3)
      .refine(uniqueIds, "Paragraph IDs must be unique"),
  })
  .strict();
const currentIndustriesPageSchema = legacyIndustriesPageSchema
  .extend({
    schemaVersion: z.literal(2),
    introduction: industriesIntroductionSchema,
    items: z
      .array(industryItemSchema)
      .max(40)
      .refine(uniqueIds, "Industry IDs must be unique")
      .refine(
        (v) => new Set(v.map((i) => i.position)).size === v.length,
        "Industry positions must be unique",
      ),
  })
  .strict();
// Owner-requested additions normalize existing CMS revisions without writing them.
// Existing content, order and disabled entries remain intact. Saves persist edits.
export const industriesPageSchema = z
  .union([currentIndustriesPageSchema, legacyIndustriesPageSchema])
  .transform((value, context) => {
    const current =
      value.schemaVersion === 2
        ? value
        : currentIndustriesPageSchema.parse({
            ...value,
            schemaVersion: 2,
            introduction: {
              id: "industries-introduction",
              enabled: false,
              label: "OUR APPROACH",
              heading:
                "Different Industries. Different Priorities. One Connected Approach.",
              paragraphs: [1, 2, 3].map((n) => ({
                id: "introduction-paragraph-" + n,
                body: "Introduction copy pending.",
              })),
            },
            items: value.items.map(({ images, ...item }) => ({
              ...item,
              heading: item.title,
              media: images[0],
            })),
          });
    const missing =
      current.localeId === "ar"
        ? []
        : directoryAdditions.filter(
            (item) =>
              !current.items.some(
                (existing) =>
                  existing.id === item.id ||
                  existing.destination === item.destination ||
                  existing.title === item.title,
              ),
          );
    let position = Math.max(-1, ...current.items.map((item) => item.position));
    const result = currentIndustriesPageSchema.safeParse({
      ...current,
      items: [
        ...current.items,
        ...missing.map((item) => ({ ...item, position: ++position })),
      ],
    });
    if (!result.success) {
      for (const issue of result.error.issues)
        context.addIssue({
          code: "custom",
          path: issue.path,
          message: issue.message,
        });
      return z.NEVER;
    }
    return result.data;
  });
export type IndustriesContent = z.infer<typeof industriesPageSchema>;
export type IndustryItem = z.infer<typeof industryItemSchema>;
