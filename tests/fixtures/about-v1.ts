import type { AboutContent, AboutSection, AboutMedia } from "../../src/schemas/about";

export const aboutMetadata = {
  title: "About CODEYEA | Digital Innovation Agency",
  description:
    "Learn how CODEYEA combines web development, eCommerce, AI automation, hosting, SEO, creative work, and technical support to help businesses grow.",
};
function media(
  mediaId: string,
  alt: string,
  width: number,
  height: number,
): AboutMedia {
  return {
    mediaId,
    alt,
    decorative: false,
    width,
    height,
    focalX: 50,
    focalY: 50,
    tabletFocalX: 50,
    tabletFocalY: 50,
    mobileFocalX: 50,
    mobileFocalY: 50,
  };
}
export function legacyAboutFixture(
  localeId = "en",
  marketId = "global",
): AboutContent {
  const section = (
    type: AboutSection["type"],
    position: number,
    heading: string,
    body = "",
    extra: Partial<AboutSection> = {},
  ): AboutSection => ({
    id: "about-" + type,
    type,
    position,
    enabled: true,
    visibility: "all",
    label: "",
    heading,
    body,
    items: [],
    ...extra,
  });
  const item = (
    id: string,
    position: number,
    title: string,
    body: string,
    image?: AboutMedia,
  ) => ({
    id,
    position,
    enabled: true,
    title,
    body,
    ...(image ? { media: image } : {}),
  });
  return {
    schemaVersion: 1,
    localeId,
    marketId,
    sharedSourcePageId: "homepage",
    seo: { ...aboutMetadata },
    sections: [
      section("hero", 0, "About Us", "", {
        media: media(
          "team",
          "A bright shared workspace with desks and computers",
          1200,
          801,
        ),
      }),
      section(
        "who",
        1,
        "Where technology, creativity, and practical thinking come together.",
        "CODEYEA is a digital innovation agency focused on helping businesses build stronger digital foundations. We work across web development, eCommerce, AI automation, hosting, SEO, branding, and technical support to solve real business problems with practical technology.\n\nSome clients come to us for a new website. Others need an online store, smarter workflows, reliable infrastructure, stronger search visibility, or ongoing technical support. We start by understanding what the business actually needs, then shape the right solution around it.",
        {
          positioning: "Digital innovation with a practical purpose.",
          label: "WHO WE ARE",
          media: media(
            "about",
            "A collaborative design session with sketches and digital devices",
            1200,
            801,
          ),
        },
      ),
      section(
        "point",
        2,
        "Good digital work should solve something.",
        "A website should do more than look good. Automation should save time. Hosting should be dependable. SEO should help the right people find the business. Technology should make work easier—not create another layer of complexity.\n\nThat principle guides how we plan, design, build, connect, and support every project.",
      ),
      section("principles", 3, "Clear thinking before execution.", "", {
        items: [
          item(
            "about-principle-think",
            0,
            "Think Before We Build",
            "We look at the business, its customers, goals, constraints, and current setup before recommending a platform, feature, or campaign.",
          ),
          item(
            "about-principle-create",
            1,
            "Create With Purpose",
            "We shape clear, useful experiences that are easy to understand, consistent with the brand, and designed around what people need to do.",
          ),
          item(
            "about-principle-build",
            2,
            "Build It Right",
            "From development and integrations to hosting and performance, we focus on dependable solutions that can be managed, supported, and improved over time.",
          ),
        ],
      }),
      section(
        "capabilities",
        4,
        "One connected view of the work behind your business.",
        "A project rarely ends at a single deliverable. Design affects development. Development depends on infrastructure. Growth relies on performance, content, analytics, and ongoing support. CODEYEA connects those parts instead of treating every need as a separate problem.",
        {
          items: [
            item(
              "about-capability-create",
              0,
              "Create",
              "Brand identity, user experience, content direction, and digital design that make the business clear and recognizable.",
              media(
                "branding",
                "A design workspace with colour swatches and a laptop",
                1100,
                1117,
              ),
            ),
            item(
              "about-capability-build",
              1,
              "Build",
              "Websites, applications, eCommerce experiences, portals, and integrations built around real users and maintainable technology.",
              media(
                "support",
                "Code on a desktop screen during development work",
                1100,
                1117,
              ),
            ),
            item(
              "about-capability-grow",
              2,
              "Grow",
              "SEO, analytics, content, and digital strategy focused on useful visibility and measurable business priorities.",
              media("commerce", "Digital commerce work on a laptop", 800, 534),
            ),
            item(
              "about-capability-run",
              3,
              "Run & Improve",
              "Hosting, infrastructure, maintenance, automation, and technical support that keep the digital operation dependable after launch.",
              media(
                "about",
                "Planning and reviewing digital work together",
                1200,
                801,
              ),
            ),
          ],
        },
      ),
      section(
        "process",
        5,
        "A clear process, adapted to the project.",
        "The scope changes from project to project, but the work should always move through clear decisions, visible progress, and practical validation.",
        {
          items: [
            item(
              "about-process-discover",
              0,
              "Discover",
              "We learn how the business works today, what users need, what is already in place, and what success should look like.",
            ),
            item(
              "about-process-define",
              1,
              "Define",
              "We organize priorities, requirements, content, user journeys, and the technical approach before production begins.",
            ),
            item(
              "about-process-create",
              2,
              "Create & Build",
              "Design and development move together through focused reviews, working prototypes, integrations, and responsive implementation.",
            ),
            item(
              "about-process-launch",
              3,
              "Launch & Improve",
              "We test, prepare the release, support the handover, and continue improving the system when the business needs to evolve.",
            ),
          ],
        },
      ),
      section(
        "markets",
        6,
        "A consistent brand with a locally relevant approach.",
        "CODEYEA works with businesses in the United States, Iraq, and other markets where our services are a good fit. We keep the same standards for strategy, design, development, and support while adapting the message, priorities, and service emphasis to the people and market involved.\n\nThe English website is written for an international audience. The future Arabic website must be professionally localized in Modern Standard Arabic with complete RTL design—not translated word for word and not written in Iraqi dialect.",
        { label: "WORKING ACROSS MARKETS" },
      ),
      section(
        "partnership",
        7,
        "The work does not end when something goes live.",
        "Websites need maintenance. Infrastructure needs monitoring. Search visibility changes. Businesses adopt new tools, and processes evolve.\n\nCODEYEA aims to remain a practical technical and creative partner when something needs to be improved, connected, repaired, expanded, or explained.",
      ),
      section("selectedWork", 8, "Selected work", "", {
        enabled: false,
        projectIds: [],
      }),
      section(
        "cta",
        9,
        "Tell us what you are trying to improve.",
        "If you have a project in mind—or a digital problem that keeps getting pushed aside—start with a conversation. We can help define the next practical step.",
        { ctaLabel: "Contact CODEYEA" },
      ),
    ],
  };
}
