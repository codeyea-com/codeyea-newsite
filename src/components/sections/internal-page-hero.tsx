import type { AboutMedia } from "@/schemas/about";
import { AboutImage } from "./about-image";
/** Identity and media are editable; geometry and the brand line are shared code. */
export function InternalPageHero({
  title,
  media,
  scrollTarget,
  semanticTitle = true,
  titleBreakBefore,
}: {
  title: string;
  media?: AboutMedia;
  scrollTarget?: string;
  semanticTitle?: boolean;
  titleBreakBefore?: string;
}) {
  const Title = semanticTitle ? "h1" : "div";
  // Only the mobile sizing tier changes; the approved title markup stays intact.
  const hasLongWord = title.split(/\s+/).some(word => word.length >= 10);
  return (
    <>
      <div className="internal-hero-copy hp-container">
        <p className="internal-hero-brand">CODEYEA</p>
        <Title
          className={"internal-hero-title" + (hasLongWord ? " internal-hero-title-long-word" : "")}
          aria-hidden={semanticTitle ? undefined : true}
        >
          {titleBreakBefore && title.endsWith(titleBreakBefore) ? <>{title.slice(0,-titleBreakBefore.length).trimEnd()}<span className="internal-hero-title-line"> {titleBreakBefore}</span></> : title}
        </Title>
      </div>
      <div className="internal-hero-media">
        <AboutImage media={media} priority sizes="100vw" />
        {scrollTarget && (
          <a
            className="internal-hero-scroll"
            href={"#" + scrollTarget}
            aria-label="Scroll to About introduction"
          >
            <span>scroll</span>
            <i aria-hidden="true" />
          </a>
        )}
      </div>
      <div className="internal-hero-space" aria-hidden="true" />
    </>
  );
}
