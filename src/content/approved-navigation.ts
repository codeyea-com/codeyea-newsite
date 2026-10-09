import { enabledItems, type EditorObject } from "@/schemas/homepage-editor";
import { str } from "@/content/homepage-render";
import { industryNames, industrySlugs } from "@/content/industry-registry";
const hosting = [
  [
    "Website Hosting",
    "A dependable home for your website.",
    "website-hosting",
    "▤",
  ],
  [
    "WordPress Hosting",
    "Hosting built around your WordPress site.",
    "wordpress-hosting",
    "W",
  ],
  [
    "Cloud Hosting",
    "More resources for growing websites.",
    "cloud-hosting",
    "☁",
  ],
  [
    "Email Hosting",
    "Professional email for your business.",
    "email-hosting",
    "✉",
  ],
  [
    "Technical Support",
    "Repairs, migration and website recovery.",
    "technical-support",
    "⌘",
  ],
];
const services = [
  [
    "Website Design & Development",
    "Websites built around your business.",
    "website-design",
    "▤",
  ],
  ["E-Commerce", "Connected shopping and store management.", "ecommerce", "▦"],
  [
    "Web & Mobile Apps",
    "Applications for your customers and team.",
    "web-mobile-apps",
    "▣",
  ],
  [
    "AI & Automation",
    "Simplify everyday business workflows.",
    "ai-automation",
    "✧",
  ],
  ["SEO & GEO", "Improve discovery across search and AI.", "seo-geo", "◎"],
  [
    "Digital Marketing",
    "Connect your audience, message and channels.",
    "digital-marketing",
    "↗",
  ],
  [
    "Brand & Graphic Design",
    "A distinctive and consistent visual identity.",
    "brand-design",
    "◇",
  ],
];
const descriptions: Record<string, string> = {
  "Healthcare & Aesthetic Clinics":
    "Digital experiences for patients and practices.",
  Construction: "Present your expertise and connect with clients.",
  "Real Estate": "Showcase properties and generate enquiries.",
  eCommerce: "Connect products, customers and operations.",
  Legal: "Communicate your practice with clarity.",
  "Oil & Gas": "Digital solutions for complex industries.",
  Roofing: "Show your work and capture project enquiries.",
  "Small Business": "Build a stronger presence for your business.",
};
function industryHref(title: string, fallback: string) {
  const aliases: Record<string, string> = {
    "Healthcare & Aesthetic Clinics": "healthcare",
    eCommerce: "e-commerce",
    "Oil & Gas": "oil-and-gas",
  };
  const slug =
    aliases[title] || industrySlugs.find((s) => industryNames[s] === title);
  return slug ? "/preview/industries/" + slug : fallback;
}
export function approvedMenuContent(content: EditorObject): EditorObject {
  const source = enabledItems(content.items),
    roots = source.filter(
      (i) =>
        !i.parentId &&
        str(i.title) !== "Domains" &&
        str(i.title) !== "Technical Support",
    ),
    items: EditorObject[] = [];
  for (const root of roots) {
    const title = str(root.title),
      id = str(root.id);
    items.push({
      ...root,
      href:
        title === "About Us"
          ? "/preview/about"
          : title === "Services"
            ? "/preview/services"
            : title === "Industries"
              ? "/preview/industries"
              : root.href,
    });
    if (title === "Hosting" || title === "Services") {
      (title === "Hosting" ? hosting : services).forEach(
        ([name, body, slug, icon], index) =>
          items.push({
            id: id + "-approved-" + index,
            parentId: id,
            title: name,
            body,
            href: "/preview/pages/" + slug,
            icon,
            enabled: true,
            position: items.length,
          }),
      );
      if (title === "Hosting")
        items.push({
          id: "approved-domains",
          title: "Domains",
          href: "/preview/pages/domains",
          enabled: true,
          position: items.length,
        });
    } else
      for (const child of source.filter((i) => i.parentId === id))
        items.push({
          ...child,
          href: industryHref(str(child.title), str(child.href)),
          body:
            descriptions[str(child.title)] ||
            str(child.body) ||
            "Explore our approach for your industry.",
          icon: "◇",
        });
  }
  return {
    ...content,
    items: items.map((i, position) => ({ ...i, position })),
  };
}
