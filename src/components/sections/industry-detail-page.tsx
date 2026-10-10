import { RoofingHubBody } from "./roofing-hub-body";
import type { IndustryItem } from "@/schemas/industries-page";
import type {
  IndustryDetailContent,
  DetailSection,
} from "@/schemas/industry-detail";
import type { HomepageContent, EditorObject } from "@/schemas/homepage-editor";
import { resolveHomepage } from "@/content/homepage-defaults";
import {
  industryPageDestination,
  servicePageDestinationForText,
} from "@/content/service-destinations";
import { publicDestination } from "@/content/public-destination";
import { HomepageHeader } from "./homepage-header";
import { HomepageFooter } from "./homepage-footer";
import { SiteUtility } from "./site-utility";
import { InternalPageHero } from "./internal-page-hero";
import { AboutImage } from "./about-image";
import { EditorialMotion } from "../motion/editorial-motion";
import "@/styles/homepage-final.css";
import "@/styles/homepage-editorial.css";
import "@/styles/about.css";
import "@/styles/industry-detail.css";
import "@fontsource/josefin-sans/latin-200.css";
import "@fontsource/josefin-sans/latin-300.css";
import "@fontsource/josefin-sans/latin-700.css";
function sharedLinks(value: unknown, preview: boolean): unknown {
  if (Array.isArray(value)) return value.map((v) => sharedLinks(v, preview));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        (k === "href" || k === "ctaHref") &&
        typeof v === "string" &&
        v.startsWith("#")
          ? v === "#about"
            ? preview
              ? "/preview/about"
              : "/about/"
            : v === "#industries"
              ? preview
                ? "/preview/industries"
                : "/industries/"
              : v === "#contact"
                ? v
                : (preview ? "/preview" : "/") + v
          : sharedLinks(v, preview),
      ]),
    );
  return value;
}
function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((p, n) => (
          <p key={n}>{p}</p>
        ))}
    </>
  );
}
export function IndustryDetailPage({
  content,
  shared,
  preview = false,
  availablePaths = [],
  industryItems = [],
}: {
  industryItems?: IndustryItem[];
  content: IndustryDetailContent;
  shared?: HomepageContent;
  preview?: boolean;
  availablePaths?: string[];
}) {
  const home = resolveHomepage(shared);
  function href(destination: string) {
    const normalized = publicDestination(destination);
    if (
      normalized === "/contact/#contact-form" ||
      destination === "#contact" ||
      destination === String(home.footer.ctaHref)
    )
      return preview
        ? "/preview/pages/contact#contact-form"
        : "/contact/#contact-form";
    if (!availablePaths.includes(destination)) return undefined;
    return preview
      ? destination === "/"
        ? "/preview"
        : destination === "/about/"
          ? "/preview/about"
          : destination === "/industries/"
            ? "/preview/industries"
            : destination === "/industries/roofing/"
              ? "/preview/industries/roofing"
              : destination
      : destination;
  }
  function Action({
    label,
    destination,
    filled = false,
  }: {
    label: string;
    destination: string;
    filled?: boolean;
  }) {
    if (!label) return null;
    const to = href(destination),
      cls = filled ? "hp-button" : "detail-action";
    return to ? (
      <a className={cls} href={to}>
        {label}
        {!filled && <span aria-hidden="true">↗</span>}
      </a>
    ) : (
      <button className={cls} type="button" aria-disabled="true">
        {label}
        {!filled && <span aria-hidden="true">↗</span>}
      </button>
    );
  }
  function Items({ s }: { s: DetailSection }) {
    if (!s.items.length) return null;
    if (s.type === "faq")
      return (
        <div className="detail-items detail-items-faq">
          {s.items.map((item) => (
            <details className="detail-item" key={item.id}>
              <summary>
                {item.title}
                <span aria-hidden="true">+</span>
              </summary>
              <Paragraphs text={item.body} />
            </details>
          ))}
        </div>
      );
    return (
      <div className={"detail-items detail-items-" + s.type}>
        {s.items.map((item, n) => {
          const inferred =
            s.type === "services"
              ? servicePageDestinationForText(
                  item.id,
                  item.title,
                  item.actionLabel,
                )
              : s.type === "related"
                ? industryPageDestination(item.title) ||
                  servicePageDestinationForText(
                    item.id,
                    item.title,
                    item.actionLabel,
                  )
                : undefined;
          const label =
            item.actionLabel ||
            ((s.type === "services" || s.type === "related") && inferred
              ? `Explore ${item.title}`
              : "");
          return (
            <article className="detail-item" key={item.id}>
              {(s.type === "growth" || s.type === "process") && (
                <span className="detail-step" aria-hidden="true">
                  {String(n + 1).padStart(2, "0")}
                </span>
              )}
              <h3>{item.title}</h3>
              <Paragraphs text={item.body} />
              <Action
                label={label}
                destination={item.destination || inferred || ""}
              />
            </article>
          );
        })}
      </div>
    );
  }
  return (
    <div className="public-surface hp about-page industry-detail-page">
      <a className="hp-skip" href="#main">
        Skip to content
      </a>
      <SiteUtility />
      <HomepageHeader
        light
        content={sharedLinks(home.header, preview) as EditorObject}
        activeHref={preview ? "/preview/industries" : "/industries/"}
        homeHref={preview ? "/preview" : "/"}
      />
      <main id="main">
        <EditorialMotion
          scope=".industry-detail-page"
          groups={[
            ".detail-heading",
            ".detail-copy",
            ".detail-items",
            ".detail-section-action",
            ".detail-media",
          ]}
          includeFigures
        />
        {content.hero.enabled !== false ? (
          <section className="about-hero">
            <InternalPageHero
              title={content.hero.title}
              media={content.hero.media}
            />
          </section>
        ) : (
          <h1 className="about-fallback-title">{content.hero.title}</h1>
        )}
        {content.schemaVersion === 2 ? (
          <RoofingHubBody
            content={content}
            industryItems={industryItems}
            availablePaths={availablePaths}
            preview={preview}
            contact={String(home.footer.ctaHref)}
          />
        ) : (
          content.sections
            .filter((s) => s.enabled)
            .map((s) => (
              <section
                key={s.id}
                id={s.id}
                className={
                  "detail-section detail-" +
                  s.type +
                  (s.media ? " detail-has-media" : "")
                }
                aria-labelledby={s.id + "-heading"}
              >
                <header className="detail-heading">
                  <p className="detail-kicker">{s.label}</p>
                  <h2 id={s.id + "-heading"}>{s.heading}</h2>
                </header>
                {s.media && (
                  <figure className="detail-media">
                    <AboutImage
                      media={s.media}
                      sizes="(max-width: 900px) 100vw, 44vw"
                    />
                  </figure>
                )}
                <div className="detail-copy">
                  <Paragraphs text={s.body} />
                </div>
                <Items s={s} />
                {s.actionLabel && (
                  <div className="detail-section-action">
                    <Action
                      label={s.actionLabel}
                      destination={s.destination}
                      filled={s.type === "cta"}
                    />
                  </div>
                )}
              </section>
            ))
        )}
      </main>
      <HomepageFooter
        content={sharedLinks(home.footer, preview) as EditorObject}
      />
    </div>
  );
}
