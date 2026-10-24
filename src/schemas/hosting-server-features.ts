import { z } from "zod";
import { hostingServerFeatures } from "@/content/hosting-server-features";

export const hostingFeatureIds = ["cpanel", "backups", "spam", "wordpress", "mail", "imunify360"] as const;
export const hostingServerFeaturesSchema = z.object({
  enabled: z.boolean(),
  label: z.string().max(200),
  heading: z.string().max(300),
  cta: z.string().max(200),
  category: z.string().max(200),
  note: z.string().max(500),
  logoNote: z.string().max(500),
  slides: z.array(z.object({
    id: z.enum(hostingFeatureIds),
    title: z.string().max(200),
    body: z.string().max(3000),
    caption: z.string().max(500),
  }).strict()).length(6).refine(slides => new Set(slides.map(slide => slide.id)).size === 6, "Keep each of the six hosting features once"),
}).strict();
export type HostingServerFeatures = z.infer<typeof hostingServerFeaturesSchema>;
export function defaultHostingServerFeatures(locale = "en"): HostingServerFeatures {
  const { previous: _previous, next: _next, status: _status, ...copy } = hostingServerFeatures[locale === "ar" ? "ar" : "en"];
  return { enabled: true, ...copy, slides: copy.slides.map(slide => ({ ...slide })) };
}
