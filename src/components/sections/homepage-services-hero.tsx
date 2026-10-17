"use client";

import { useEffect, useMemo, useRef } from "react";
import { heroContent } from "./homepage-services-hero/content";
import { mountHero } from "./homepage-services-hero/timeline";
import "@/styles/homepage-services-hero.css";

/** The approved hero is rendered on the server, then its existing layers animate. */
export function HomepageServicesHero({ arabic }: { arabic: boolean }) {
  const root = useRef<HTMLElement>(null);
  const content = useMemo(() => heroContent(arabic), [arabic]);

  useEffect(() => {
    if (root.current) return mountHero(root.current, arabic, content.slides);
  }, [arabic, content]);

  return (
    <section
      ref={root}
      id="top"
      className="hp-services-hero"
      lang={arabic ? "ar" : "en"}
      dir={arabic ? "rtl" : "ltr"}
      aria-roledescription="carousel"
      aria-label={arabic ? "خدمات كوديا" : "CODEYEA services"}
      dangerouslySetInnerHTML={{ __html: content.html }}
    />
  );
}
