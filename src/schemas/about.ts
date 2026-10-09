import { z } from "zod";
import { stableId } from "./contract-primitives";
import { editorMediaSchema } from "./homepage-editor";
import {seoTextSchema} from './seo-text';

export const aboutSectionTypes = [
  "hero",
  "who",
  "point",
  "principles",
  "capabilities",
  "process",
  "markets",
  "partnership",
  "selectedWork",
  "cta",
  "experience",
  "projectReference",
  "showcase",
  "awards",
] as const;
const focal = z.number().min(0).max(100);
export const aboutMediaSchema = editorMediaSchema.safeExtend({
  tabletFocalX: focal,
  tabletFocalY: focal,
  mobileFocalX: focal,
  mobileFocalY: focal,
});
export const aboutItemSchema = z
  .object({
    id: stableId,
    position: z.number().int().nonnegative(),
    enabled: z.boolean(),
    title: z.string().trim().max(180),
    body: z.string().trim().max(3000),
    media: aboutMediaSchema.optional(),
    label: z.string().trim().max(100).optional(),
    ctaLabel: z.string().trim().max(80).optional(),
  })
  .strict();
export const aboutSectionSchema = z
  .object({
    id: stableId,
    type: z.enum(aboutSectionTypes),
    position: z.number().int().nonnegative(),
    enabled: z.boolean(),
    visibility: z.enum(["all", "desktop", "tablet", "mobile"]),
    label: z.string().trim().max(100),
    heading: z.string().trim().max(240),
    body: z.string().trim().max(5000),
    positioning: z.string().trim().max(5000).optional(),
    media: aboutMediaSchema.optional(),
    items: z.array(aboutItemSchema).max(24),
    projectIds: z.array(stableId).max(12).optional(),
    ctaLabel: z.string().trim().max(80).optional(),
  })
  .strict()
  .superRefine((s, ctx) => {
    if (s.enabled && !s.heading)
      ctx.addIssue({
        code: "custom",
        path: ["heading"],
        message: "An enabled section needs a heading",
      });
    if (s.type === "hero" && !s.heading)
      ctx.addIssue({
        code: "custom",
        path: ["heading"],
        message: "Keep a page title for the heading hierarchy",
      });
    if (s.type !== "who" && s.positioning)
      ctx.addIssue({
        code: "custom",
        path: ["positioning"],
        message: "Positioning belongs to the introduction",
      });
    const limit =
      s.type === "principles"
        ? 3
        : ["capabilities", "process", "projectReference"].includes(s.type)
          ? 4
          : s.type === "experience" ? 2
          : s.type === "showcase" ? 4
          : s.type === "awards" ? 3
          : 0;
    if (s.items.length > limit)
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "Keep the approved collection size",
      });
    // Empty and three-slide collections remain readable in earlier saved revisions.
    if (s.type === "showcase" && s.items.length) {
      const ids = ["about-showcase-social", "about-showcase-mobile", "about-showcase-ecommerce", "about-showcase-ai"];
      if (![3, 4].includes(s.items.length) || s.items.some((item, index) =>
        item.id !== ids[index] || item.position !== index || !item.enabled ||
        !item.title || !item.body || !item.media || !item.label || !item.ctaLabel))
        ctx.addIssue({code:"custom",path:["items"],message:"Keep the Showcase slides in their fixed order, with image, title, label, copy and button label (up to four; earlier three-slide revisions remain supported)."});
    }
    if (s.type !== "showcase" && s.items.some(item => item.label !== undefined || item.ctaLabel !== undefined))
      ctx.addIssue({code:"custom",path:["items"],message:"Slide labels belong only to Showcase."});
    if (s.id !== `about-${s.type}`)
      ctx.addIssue({
        code: "custom",
        path: ["id"],
        message: "Keep the stable section identity",
      });
    if (
      new Set(s.items.map((i) => i.id)).size !== s.items.length ||
      new Set(s.items.map((i) => i.position)).size !== s.items.length
    )
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "Item identities and positions must be unique",
      });
    if (s.type === "selectedWork" && !s.projectIds)
      ctx.addIssue({
        code: "custom",
        path: ["projectIds"],
        message: "Project references are required",
      });
    if (s.type !== "selectedWork" && s.projectIds)
      ctx.addIssue({
        code: "custom",
        path: ["projectIds"],
        message: "Only selected work accepts project references",
      });
    if (s.projectIds && new Set(s.projectIds).size !== s.projectIds.length)
      ctx.addIssue({
        code: "custom",
        path: ["projectIds"],
        message: "Project references must be unique",
      });
  });
export const aboutSchema = z
  .object({
    schemaVersion: z.union([z.literal(1), z.literal(2)]),
    localeId: stableId,
    marketId: stableId,
    sharedSourcePageId: z.literal("homepage"),
    seo: seoTextSchema,
    sections: z.array(aboutSectionSchema).min(7).max(10),
  })
  .strict()
  .superRefine((v, ctx) => {
    const required = v.schemaVersion === 1
      ? aboutSectionTypes.slice(0, 10)
      : ["hero", "who", "experience", "projectReference", "principles", "showcase", "awards"];
    if (
      v.sections.length !== required.length ||
      !required.every(type => v.sections.some(s => s.type === type)) ||
      new Set(v.sections.map((s) => s.type)).size !== required.length ||
      new Set(v.sections.map((s) => s.position)).size !== v.sections.length
    )
      ctx.addIssue({
        code: "custom",
        path: ["sections"],
        message: "Keep each About section exactly once with unique positions",
      });
    const ids = v.sections.flatMap((s) => s.items.map((i) => i.id));
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({
        code: "custom",
        path: ["sections"],
        message: "Item identities must be unique across About",
      });
  });
export type AboutContent = z.infer<typeof aboutSchema>;
export type AboutSection = z.infer<typeof aboutSectionSchema>;
export type AboutItem = z.infer<typeof aboutItemSchema>;
export type AboutMedia = z.infer<typeof aboutMediaSchema>;
