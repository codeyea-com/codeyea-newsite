import { services, industries } from "@/schemas/content";

// Review-only fixtures: never seed these into a draft or published snapshot.
export type ReviewItem = { id: string; title: string; body: string };
const descriptions = [
  "Modern websites, web apps, portals and digital platforms built for usability and performance.",
  "Online stores, payment integrations and product experiences that make selling online easier.",
  "Practical AI tools, workflow automation and integrations that reduce repetitive work.",
  "Web hosting, business email, domains, DNS, migrations and technical infrastructure.",
  "Technical SEO, local search, content strategy and analytics for digital growth.",
  "Brand identity, graphic design, UI/UX and digital assets that make your business easier to recognize.",
  "WordPress support, troubleshooting, maintenance and ongoing technical help.",
  "Clear guidance on the right technology, channels and next steps for your business.",
] as const;
export const serviceFixtures: readonly ReviewItem[] = services.map(
  (title, i) => ({ id: `service-${i + 1}`, title, body: descriptions[i] }),
);
export const industryFixtures = industries.map((title, i) => ({
  id: `industry-${i + 1}`,
  title,
}));
export const accordionFixtures: readonly ReviewItem[] = [
  {
    id: "design",
    title: "Exquisite designs for lasting impressions",
    body: "Bring your identity into focus with a consistent visual language and considered details.",
  },
  {
    id: "responsive",
    title: "Seamless experiences across devices",
    body: "Plan layouts and interactions for the screens your customers use every day.",
  },
  {
    id: "security",
    title: "Security considered from the start",
    body: "Make access, maintenance and the handling of information part of the project conversation.",
  },
  {
    id: "search",
    title: "A foundation for your online presence",
    body: "Connect useful content with a clear structure that people can explore.",
  },
  {
    id: "hosting",
    title: "Hosting that supports your next step",
    body: "Match infrastructure decisions to your website’s needs and long-term plans.",
  },
];
export const flowFixtures: readonly ReviewItem[] = [
  {
    id: "technical-support",
    title: "Technical support for the work ahead.",
    body: "Websites and online systems need ongoing attention. Plugins update, integrations fail, pages slow down and forms stop sending. CODEYEA provides practical technical support to investigate, fix, maintain and explain what is happening.",
  },
  {
    id: "branding",
    title: "Give your brand a voice of its own.",
    body: "Branding is the visual language people associate with your business, from your website and social profiles to proposals, printed material and digital products. We help create or refine that identity so your business feels consistent wherever customers meet it.",
  },
  {
    id: "ecommerce",
    title: "Turn your next idea into an online store.",
    body: "An online store needs to be easy to browse, easy to trust and easy to operate after launch. We build and improve stores with the customer journey, product management, payments, performance and growth in mind.",
  },
];
export const hostingFixtures = [
  {
    title: "Superb",
    price: "$14",
    storage: "5 GB",
    bandwidth: "20 GB",
    domains: "2",
  },
  {
    title: "Colossal",
    price: "$21",
    storage: "20 GB",
    bandwidth: "40 GB",
    domains: "Unlimited",
  },
  {
    title: "Business",
    price: "$35",
    storage: "Unlimited",
    bandwidth: "Unlimited",
    domains: "Unlimited",
  },
] as const;
