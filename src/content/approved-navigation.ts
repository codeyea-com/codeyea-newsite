import { enabledItems, type EditorObject } from "@/schemas/homepage-editor";
import { str } from "@/content/homepage-render";
import { industryNames, industrySlugs } from "@/content/industry-registry";
import { arabicNavigation, localizedHref } from "./arabic-navigation";
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
];
const services = [
  [
    "Technical Support",
    "Repairs, migration and website recovery.",
    "technical-support",
    "⌘",
  ],
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
  if (fallback && !fallback.includes("#"))
    return fallback.startsWith("/industries/")
      ? fallback.replace("/industries/", "/preview/industries/")
      : fallback;
  const aliases: Record<string, string> = {
    "Healthcare & Aesthetic Clinics": "healthcare",
    eCommerce: "e-commerce",
    "Oil & Gas": "oil-and-gas",
  };
  const slug =
    aliases[title] || industrySlugs.find((s) => industryNames[s] === title);
  return slug ? "/preview/industries/" + slug : fallback;
}
export function approvedMenuContent(
  content: EditorObject,
  surface: boolean | "preview" | "public" = true,
  locale = "en",
): EditorObject {
  const preview = surface === true || surface === "preview";
  const source = enabledItems(content.items).map((item) =>
      locale === "ar"
        ? {
            ...item,
            title:
              Object.keys(arabicNavigation).find(
                (key) => arabicNavigation[key] === item.title,
              ) ?? item.title,
            href: str(item.href).replace(/^\/ar\//, "/"),
          }
        : item,
    ),
    roots = source.filter(
      (i) =>
        !i.parentId &&
        str(i.title) !== "Work" &&
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
              : title === "Hosting"
                ? "/preview/pages/website-hosting"
                : title === "Contact"
                  ? "/preview/pages/contact"
                  : root.href,
    });
    if (title === "Hosting" || title === "Services") {
      const configured = source.filter(
        (child) =>
          child.parentId === id &&
          (title !== "Hosting" ||
            !str(child.href).includes("technical-support")),
      );
      const saved =
        configured.length > 0 &&
        configured.every(
          (child) =>
            str(child.href).startsWith("/") &&
            !str(child.href).startsWith("/#"),
        );
      if (saved)
        for (const child of configured) {
          const defaults = (title === "Hosting" ? hosting : services).find(
            ([name, , slug]) =>
              name === str(child.title) || str(child.href).includes("/" + slug),
          );
          items.push({
            ...child,
            href: str(child.href).replace(
              /^\/(?!preview\/)/,
              "/preview/pages/",
            ),
            body: str(child.body) || defaults?.[1] || "",
            icon: str(child.icon) || defaults?.[3] || "◇",
          });
        }
      else
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
      if (
        title === "Services" &&
        !items.some(
          (child) =>
            child.parentId === id &&
            str(child.href).includes("technical-support"),
        )
      )
        items.push({
          id: id + "-technical-support",
          parentId: id,
          title: "Technical Support",
          body: "Repairs, migration and website recovery.",
          href: "/preview/pages/technical-support",
          icon: "⌘",
          enabled: true,
          position: items.length,
        });
      if (title === "Hosting")
        items.push({
          id: "approved-domains",
          title: "Domains",
          href: "/preview/pages/domains",
          enabled: true,
          position: items.length,
        });
    } else if (title === "Industries") {
      const children = source.filter((child) => child.parentId === id);
      for (const child of children)
        items.push({
          ...child,
          href: industryHref(str(child.title), str(child.href)),
          body:
            descriptions[str(child.title)] ||
            str(child.body) ||
            "Explore our approach for your industry.",
          icon: "◇",
        });
      industrySlugs
        .filter(
          (slug) =>
            !items.some(
              (item) =>
                item.parentId === id &&
                item.href === "/preview/industries/" + slug,
            ),
        )
        .forEach((slug) =>
          items.push({
            id: id + "-industry-" + slug,
            parentId: id,
            title: industryNames[slug],
            href: "/preview/industries/" + slug,
            body:
              descriptions[industryNames[slug]] ||
              "Explore our approach for your industry.",
            icon: "◇",
            enabled: true,
            position: items.length,
          }),
        );
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
  if (!items.some((i) => !i.parentId && str(i.title) === "Contact"))
    items.push({
      id: "approved-contact",
      title: "Contact",
      href: "/preview/pages/contact",
      enabled: true,
      position: items.length,
    });
  return {
    ...content,
    language: locale,
    items: items.map((i, position) => ({
      ...i,
      position,
      ...(locale === "ar"
        ? {
            title: arabicNavigation[str(i.title)] ?? i.title,
            body: arabicNavigation[str(i.body)] ?? i.body,
          }
        : {}),
      href:
        locale === "ar"
          ? localizedHref(preview ? str(i.href) : publicHref(str(i.href)))
          : preview
            ? i.href
            : publicHref(str(i.href)),
    })),
  };
}

function publicHref(href: string) {
  const value = href
    .replace("/preview/pages/", "/")
    .replace("/preview/", "/")
    .replace(/^\/preview$/, "/");
  return value.startsWith("/") && !value.includes("#") && !value.includes("?")
    ? value.replace(/\/$/, "") + "/"
    : value;
}
