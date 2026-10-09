import { resolveHomepage, iconKeys } from "@/content/homepage-defaults";
import "@/styles/homepage-final.css";
import { enabledItems, type EditorObject } from "@/schemas/homepage-editor";
import { str, mediaProps } from "@/content/homepage-render";
import { ServiceWords } from "./homepage-service-words";
import { EditorialCopy } from "./homepage-editorial-copy";
import { HomepageFooter } from "./homepage-footer";
import "@/styles/homepage-editorial.css";
import { HomepageHeader } from "./homepage-header";
import { HomepageHeroExperience } from "./homepage-hero-experience";
import { createHeroServiceSlides } from "./homepage-hero-model";
import { SiteUtility } from "./site-utility";
import { HomepageHosting } from "./homepage-hosting";
import {
  Carousel,
  ServiceFlow,
  HomepageMotion,
} from "./homepage-interactions";
import type { Snapshot } from "@/schemas/content";
import "@/styles/homepage-morph-hero.css";
import {
  accordionFixtures,
  flowFixtures,
  industryFixtures,
  serviceFixtures,
} from "@/content/homepage-review";

function ServiceIcon({ index }: { index: number }) {
  const paths = [
    "M3 4h18v14H3zM3 8h18M9 11l-3 2 3 2m6-4 3 2-3 2M8 22h8m-4-4v4",
    "M3 3h2l3 13h11l2-10H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2m9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2M10 10h7",
    "M7 7h10v10H7zM10 10h4v4h-4zM9 3v4m6-4v4M9 17v4m6-4v4M3 9h4m-4 6h4m10-6h4m-4 6h4",
    "M3 3h18v7H3zm0 11h18v7H3zM6 6.5h.01M6 17.5h.01M11 6.5h7M11 17.5h7",
    "M3 3v18h18M6 16l5-5 4 3 6-8m-6 0h6v6",
    "M4 20l1-6L16 3l5 5-11 11-6 1zm8-13 5 5M5 14l5 5M4 20l4-4",
    "M4 14v-3a8 8 0 0 1 16 0v3M4 11H2v7h4v-7H4m16 0h2v7h-4v-7h2m0 7v3h-7",
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M16 8l-2 6-6 2 2-6 6-2z",
  ];
  return (
    <svg
      className="hp-service-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[index] ?? paths[0]} />
    </svg>
  );
}
const nav = [
  { title: "About Us", href: "#about" },
  { title: "Services", href: "#services" },
  { title: "Hosting", href: "#hosting" },
  { title: "Industries", href: "#industries" },
  { title: "Work", href: "#work" },
];
function Navigation() {
  return (
    <>
      {nav.map((item) => (
        <a key={item.href} href={item.href}>
          {str(item.title)}
        </a>
      ))}
    </>
  );
}

export function Homepage({ snapshot }: { snapshot: Snapshot | null }) {
  const home = resolveHomepage(snapshot?.homepage);
  const services = enabledItems(home.services.items),
    about = home.about,
    experience = home.experience,
    hero = home.hero,
    footer = home.footer;
  return (
    <div className="public-surface hp">
      <HomepageMotion />
      <a className="hp-skip" href="#main">
        Skip to content
      </a>
      <SiteUtility />
      <HomepageHeader content={home.header} />
      <main id="main">
        {hero.enabled !== false && <HomepageHeroExperience
          slides={createHeroServiceSlides(services)}
          ctaLabel={str(hero.ctaLabel)}
          ctaHref={str(hero.ctaHref)}
        />}
        <aside className="hp-review hp-container">
          <strong>Homepage design review</strong>
          <span>
            Published positioning appears below. Other copy, pricing and project
            examples await approval. Photography is recovered from the existing
            site. Client marks below require relationship approval.
          </span>
        </aside>
        {home.logos.enabled !== false && <section
          className="hp-clients hp-container"
          aria-label="Existing site logos; client relationships awaiting confirmation"
        >
          {enabledItems(home.logos.items).map((logo) => {
            const image = (
              <img
                key={str(logo.id)}
                {...mediaProps(logo.media)}
                width="150"
                height="65"
                loading="lazy"
              />
            );
            return logo.href ? (
              <a
                key={str(logo.id)}
                href={str(logo.href)}
                aria-label={str(logo.title)}
              >
                {image}
              </a>
            ) : (
              image
            );
          })}
        </section>}
        <section
          id="positioning"
          className="hp-positioning hp-container"
          aria-labelledby="positioning-title"
        >
          {snapshot ? (
            snapshot.sections.filter(section=>section.enabled!==false).map((section) => (
              <div key={section.id}>
                <h2 id="positioning-title">{section.heading}</h2>
                <p className="hp-positioning-body">{section.body}</p>
              </div>
            ))
          ) : (
            <>
              <h2 id="positioning-title">Digital Innovation Agency</h2>
              <p>No positioning content has been published yet.</p>
            </>
          )}
        </section>
        {home.services.enabled !== false && <section
          id="services"
          className="hp-services hp-container"
          aria-label="Our eight services"
        >
          {services.map((service, i) => (
            <article
              id={str(service.id)}
              key={str(service.id)}
              data-motion-enter
              style={{ transitionDelay: (i % 4) * 70 + "ms" }}
            >
              <ServiceIcon index={iconKeys.indexOf(str(service.icon))} />
              <h3>
                <ServiceWords text={str(service.title)} />
              </h3>
              <p>
                <ServiceWords
                  text={str(service.body)}
                  offset={str(service.title).split(/\s+/).length}
                />
              </p>
              <a
                className="hp-service-link"
                href={str(service.ctaHref)}
                aria-label={"Discuss " + str(service.title)}
              >
                {str(service.ctaLabel)} <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </section>}
        {about.enabled !== false && <section id="about" className="hp-about">
          <img
            className="hp-about-media"
            {...mediaProps(about.media)}
            width="1200"
            height="801"
            loading="lazy"
          />
          <div className="hp-about-copy">
            <p className="hp-eyebrow">{str(about.eyebrow)}</p>
            <h2>
              {str(about.heading)
                .split("Creativity")
                .map((part, i) => (
                  <span key={i}>
                    {i > 0 && <mark>Creativity</mark>}
                    {part}
                  </span>
                ))}
            </h2>
            <EditorialCopy text={str(about.body)} />
            <div className="hp-accordions">
              {enabledItems(about.items).map((item, i) => (
                <details key={str(item.id)} open={i === 0} name="about-values">
                  <summary>
                    {str(item.title)}
                    <span aria-hidden="true" />
                  </summary>
                  <p>{str(item.body)}</p>
                </details>
              ))}
            </div>
            <a className="hp-button" href={str(about.ctaHref)}>
              {str(about.ctaLabel)}
            </a>
          </div>
        </section>}
        {experience.enabled !== false && <section
          className="hp-experience"
          aria-labelledby="experience-title"
          style={{
            backgroundImage: `url("${mediaProps(experience.media).src}")`,
            backgroundPosition: mediaProps(experience.media).style
              .objectPosition,
          }}
        >
          {mediaProps(experience.media).alt && (
            <span
              className="hp-interaction-sr"
              role="img"
              aria-label={mediaProps(experience.media).alt}
            />
          )}
          <div className="hp-experience-panel" data-motion-enter>
            <div>
              <h2 id="experience-title">{str(experience.heading)}</h2>
              <EditorialCopy text={str(experience.body)} />
              <a className="hp-text-action" href={str(experience.ctaHref)}>
                {str(experience.ctaLabel)} <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="hp-experience-number">
              <strong data-count-to={Number(experience.value)}>
                {Number(experience.value)}
              </strong>
              <span>{str(experience.unit)}</span>
              {!experience.approved && (
                <small>Reference claim · verification pending</small>
              )}
            </div>
          </div>
        </section>}
        {home.flow.enabled !== false && <section
          id="service-flow"
          className="hp-flow-section"
          aria-label="Our approach"
        >
          <ServiceFlow
            panels={enabledItems(home.flow.items).map((item, i) => ({
              id: str(item.id),
              title: str(item.title),
              body: str(item.body),
              image: mediaProps(item.media).src,
              srcSet: mediaProps(item.media).srcSet,
              alt: mediaProps(item.media).alt,
              focal: mediaProps(item.media).style.objectPosition,
              kicker:
                (
                  {
                    "technical-support": "Technical support",
                    branding: "Branding & creative",
                    ecommerce: "eCommerce solutions",
                  } as Record<string, string>
                )[str(item.id)] ?? str(item.title),
              ctaLabel: str(item.ctaLabel),
              ctaHref: str(item.ctaHref),
            }))}
          />
        </section>}
        {home.hosting.enabled !== false && <HomepageHosting content={home.hosting} />}
        {home.projects.enabled !== false && <section
          id="work"
          className="hp-portfolio"
          aria-labelledby="work-title"
        >
          <Carousel
            label="Project previews"
            variant="project"
            filterable
            intro={home.projects}
            items={enabledItems(home.projects.items)
              .sort((a, b) => Number(b.featured) - Number(a.featured))
              .map((item) => ({
                id: str(item.id),
                title: str(item.title),
                body: str(item.body),
                category: str(item.categories),
                image: mediaProps(item.media).src,
                srcSet: mediaProps(item.media).srcSet,
                alt: mediaProps(item.media).alt,
                focal: mediaProps(item.media).style.objectPosition,
                href: str(item.href),
              }))}
          />
        </section>}
        {home.industries.enabled !== false && <section
          id="industries"
          className="hp-industries"
          aria-labelledby="industries-title"
        >
          <div className="hp-container hp-industries-intro">
            <h2 id="industries-title">{str(home.industries.heading)}</h2>
            <p>{str(home.industries.body)}</p>
            <a href={str(home.industries.ctaHref)}>
              {str(home.industries.ctaLabel)} <span aria-hidden="true">→</span>
            </a>
          </div>
          <div id="industry-list">
            <Carousel
              label="Industries"
              variant="industry"
              autoplay
              items={enabledItems(home.industries.items).map((item) => ({
                id: str(item.id),
                title: str(item.title),
                body: str(item.body),
                category: str(item.eyebrow),
                image: mediaProps(item.media).src,
                srcSet: mediaProps(item.media).srcSet,
                alt: mediaProps(item.media).alt,
                focal: mediaProps(item.media).style.objectPosition,
                href: str(item.href),
              }))}
            />
          </div>
        </section>}
      </main>
      <HomepageFooter content={footer} />
    </div>
  );
}
