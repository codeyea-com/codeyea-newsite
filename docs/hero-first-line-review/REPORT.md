# Shared internal Hero alignment

Application file changed: `src/styles/about.css` only.

The previous media position followed the full natural title height with a fixed negative margin: -36px desktop and -24px mobile. A separate desktop-only selector compensated for About's manually broken title. Natural extra lines still pushed the image downward.

The title now uses `block-size: .5lh`; media uses `margin-top: 0`. The desktop exception and mobile margin override were removed. The existing visible overflow and copy z-index let subsequent title lines paint over the image. The `lh` unit follows the unchanged responsive title line-height automatically, without JavaScript or page-specific exceptions.

## Verification

Seven shared Hero pages tested at 1440, 1024, 768, 390 and 320px: Roofing, Restaurants/Cafés/Bakeries, Fashion and Lifestyle, Beauty/Skincare/Med Spa, Solar Energy, About and Industries. All 35 checks position the image top at 0.500 of the first title line-height. One H1, no mid-word breaks, no horizontal overflow, and all title text within the visible Hero bounds.

Before/after computed font family, font size, font weight, line-height, letter spacing, wrapping properties, text width, image dimensions, image focal position and z-index are identical. Single-line titles retain the midpoint composition; the exact overlap is now half a line across all breakpoints. Wrapped titles no longer add height above the image.

Normal motion, keyboard/touch FAQ controls, reduced-motion final states and JavaScript-disabled content checked. Saved draft versions, complete draft snapshots and publication snapshots match the pre-change baseline for all 14 industries, Homepage, About and the main Industries page. No CMS save or publication action was performed.

TypeScript and production build passed. Verification helpers: `.local/hero-first-line/check.mjs` and `.local/hero-first-line/fallbacks.mjs`. Review artifacts are in `docs/hero-first-line-review/`.

Native before/after captures include Roofing and Restaurants at 1440px and 390px. Restaurants remains naturally three lines on mobile; its typography was not altered to force two lines.

External image-provider requests: **0**. New external image imports: **0**. AI-generated images: **0**. All imagery remains temporary; existing assets, crops, focal positions and metadata were unchanged. No provider key was exposed. Nothing published or deployed.
