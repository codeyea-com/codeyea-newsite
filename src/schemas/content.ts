import {homepageEditorSchema} from "./homepage-editor";
import {aboutSchema} from "./about";
import {industriesPageSchema} from './industries-page';
import {industryDetailSchema} from './industry-detail';
import {servicesPageSchema} from './services-page';
import { z } from "zod";
export const sectionSchema = z
  .object({
    id: z.string().min(1).max(100),
    type: z.literal("positioning"),
    enabled: z.boolean().optional(),
    heading: z.string().trim().min(1).max(180),
    body: z.string().trim().max(2000),
  })
  .strict();
export const snapshotSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    homepage: homepageEditorSchema.optional(),
    about: aboutSchema.optional(),
    industriesPage: industriesPageSchema.optional(),
    industryDetail: industryDetailSchema.optional(),
    servicesPage: servicesPageSchema.optional(),
    sections: z.array(sectionSchema).max(1),
  })
  .strict().refine(v=>{const details=[v.about,v.industriesPage,v.industryDetail,v.servicesPage].filter(Boolean).length;return details?details===1&&!v.homepage&&v.sections.length===0:v.sections.length===1},'Page snapshots must not be mixed');
export const draftSchema = snapshotSchema
  .safeExtend({
    pageId: z.string().min(1).max(100),
    expectedVersion: z.number().int().positive(),
  })
  .strict();
export const restoreSchema = z
  .object({
    pageId: z.string().min(1).max(100),
    revisionId: z.string().min(1).max(100),
    expectedVersion: z.number().int().positive(),
  })
  .strict();
export type Snapshot = z.infer<typeof snapshotSchema>;
export const services = [
  "Web & App Development",
  "eCommerce Solutions",
  "AI & Automation",
  "Hosting & Infrastructure",
  "SEO & Digital Growth",
  "Branding & Creative",
  "Technical Support",
  "Digital Strategy",
] as const;
export const industries = [
  "Healthcare & Aesthetic Clinics",
  "Construction",
  "Real Estate",
  "eCommerce",
  "Legal",
  "Oil & Gas",
  "Roofing",
  "Small Business",
] as const;
// Future modules share locale/market identity and provider-neutral checkout boundaries.
export const localizedIdentity = z.object({
  id: z.string(),
  localeId: z.string(),
  marketId: z.string(),
});
export const hostingTarget = z.object({
  platform: z.enum(["WHMCS", "UPMIND", "OTHER"]),
  checkoutUrl: z.url().refine((v) => new URL(v).protocol === "https:"),
  externalId: z.string().optional(),
});
