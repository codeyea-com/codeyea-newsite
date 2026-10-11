import { z } from "zod";
const href = z
  .string()
  .max(500)
  .refine(
    (value) => /^\/(?!\/)[^\s]*$/.test(value),
    "Use an internal site URL",
  );
const section = z
  .object({
    enabled: z.boolean(),
    label: z.string().max(200),
    heading: z.string().max(500),
    body: z.string().max(4000),
    actionLabel: z.string().max(200),
    href,
    mediaId: z.string().max(100),
    alt: z.string().max(300),
    items: z
      .array(
        z.object({ title: z.string().max(200), body: z.string().max(3000) }),
      )
      .max(12),
  })
  .strict();
export const pageAdditionsSchema = z
  .object({
    introWords: z.array(z.string().min(1).max(120)).min(1).max(8).optional(),
    support: section.optional(),
    search: section.optional(),
    discount: z
      .object({
        enabled: z.boolean(),
        percent: z.number().int().min(0).max(100),
        label: z.string().max(200),
      })
      .strict()
      .optional(),
  })
  .strict();
export type PageAdditions = z.infer<typeof pageAdditionsSchema>;
export function pageAdditionsDefaults(slug: string): PageAdditions {
  const hosting: Record<string, [string, string]> = {
    "website-hosting": [
      "Hosting is the foundation. Support keeps it working.",
      "From website errors and database issues to a careful move between hosts, get practical help with the systems your website depends on.",
    ],
    "wordpress-hosting": [
      "Your WordPress site deserves expert care.",
      "Plugin conflicts, broken updates or an unexpected outage? Get help diagnosing the cause, restoring your site and planning the next safe step.",
    ],
    "cloud-hosting": [
      "More resources. Support for the next step.",
      "Get help with application issues, website migrations and the technical changes that come with growing onto cloud hosting.",
    ],
    "email-hosting": [
      "Keep business conversations moving.",
      "Get help with mailbox migration, domain and DNS configuration, or delivery issues so your team can communicate with confidence.",
    ],
  };
  const text = hosting[slug];
  return text
    ? {
        support: {
          enabled: true,
          label: "TECHNICAL SUPPORT",
          heading: text[0],
          body: text[1],
          actionLabel: "Explore Technical Support",
          href: "/technical-support/",
          mediaId: "",
          alt: "Developer diagnosing website issues",
          items: [],
        },
        discount: {
          enabled: true,
          percent: slug === "email-hosting" ? 10 : 20,
          label: "With annual billing",
        },
      }
    : slug === "seo-geo"
      ? {
          search: {
            enabled: true,
            label: "SEO / AEO / GEO",
            heading: "Be discoverable. Be the answer. Be a trusted source.",
            body: "Build a connected search presence across traditional results, direct answers and AI generated responses. We combine sound technical SEO with clear, useful content that people and search systems can understand.",
            actionLabel: "Discuss Your Search Visibility",
            href: "/contact/#contact-form",
            mediaId: "",
            alt: "",
            items: [
              {
                title: "SEO — Search Engine Optimization",
                body: "Strengthen crawlability, indexing, site structure and useful content so customers can discover your pages in organic search.",
              },
              {
                title: "AEO — Answer Engine Optimization",
                body: "Structure clear answers to real customer questions, supported by accurate facts and relevant structured data, for search features and answer experiences.",
              },
              {
                title: "GEO — Generative Engine Optimization",
                body: "Make your expertise easier to understand and cite through consistent business information, evidence, clear passages and accessible content. Track AI visibility where reliable data is available.",
              },
            ],
          },
        }
      : {};
}
export function resolvePageAdditions(
  slug: string,
  value?: PageAdditions,
): PageAdditions {
  return { ...pageAdditionsDefaults(slug), ...value };
}
