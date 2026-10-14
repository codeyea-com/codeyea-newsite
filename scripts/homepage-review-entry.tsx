import React from "react";
import { createRoot } from "react-dom/client";
import "../src/app/globals.css";
import "../src/styles/surface.css";
import "@fontsource/josefin-sans/latin-400.css";
import "@fontsource/josefin-sans/latin-500.css";
import "@fontsource/josefin-sans/latin-600.css";
import "../src/styles/tokens.css";
import "../src/styles/homepage.css";
import "../src/styles/homepage-interactions.css";
import "../src/styles/homepage-motion.css";
import "../src/styles/homepage-refinements.css";
import "../src/styles/homepage-mobile.css";
import { Homepage } from "../src/components/sections/homepage";
import { ArabicSurface } from "../src/components/sections/arabic-surface";
import type { Snapshot } from "../src/schemas/content";

const snapshot = JSON.parse(
  document.getElementById("review-data")!.textContent!,
) as Snapshot;
const page = <Homepage snapshot={snapshot} />;
createRoot(document.getElementById("root")!).render(
  snapshot.homepage?.localeId === "ar" ? (
    <ArabicSurface>{page}</ArabicSurface>
  ) : (
    page
  ),
);

// Follow the chosen section after the actual React component has mounted.
const anchor = location.hash.slice(1);
if (anchor) {
  const observer = new MutationObserver(() => {
    const section = document.getElementById(anchor);
    if (section) {
      observer.disconnect();
      // Font layout must settle before resolving the deep-link position.
      section.getBoundingClientRect();
      void document.fonts.ready.then(() =>
        requestAnimationFrame(() => window.scrollTo({
          top: section.getBoundingClientRect().top + window.scrollY - 110,
          behavior: 'instant',
        })),
      );
    }
  });
  observer.observe(document.getElementById("root")!, { childList: true });
}
