# Current checkpoint — 16 September 2026

Final homepage refinement is ready for owner review. See HOMEPAGE_FINAL_REVIEW.md and final-homepage-review/ for current evidence. The historical checkpoint below is retained for context; no other pages or CMS expansion are authorized.

# Homepage design checkpoint — 2026-09-13

Status: frontend visual review ready; CMS development remains paused. Stop for owner review.

Completed: recovered and optimized original site imagery; hero and footer rotating words with pause controls; real client marks with approval notice; published positioning preserved; eight approved service cards; five keyboard accordions; experience background; desktop GSAP pinned service imagery; mobile/reduced-motion inline service images; monthly/annual hosting toggle; filtered portfolio carousel; eight-industry carousel with arrows, keyboard browsing and pause; responsive navigation that closes after selection and Escape; sticky header and scroll progress; navy/cyan identity and local Josefin Sans.

Relevant files: src/components/sections/homepage.tsx, homepage-header.tsx, homepage-hosting.tsx, homepage-interactions.tsx; src/styles/homepage.css and homepage-interactions.css; public/homepage; e2e/homepage.spec.ts. Provenance: HOMEPAGE_ASSET_PROVENANCE.md.

Verification: npm test 24/24; npm run test:e2e 5/5 (including isolated Save draft/Publish); npm run typecheck passed; npm run build passed. Responsive checks 320,375,768,1024,1366,1440 and 812x375; keyboard menu/accordion/carousel/filter/billing and reduced motion covered. Browser production visual checks: hero, about, service flow, hosting, portfolio, industries, footer; mobile hero and portfolio reviewed. No owner content or WordPress changed or published; no deployment.

Preview: http://127.0.0.1:3000 (old server restarted to load current build). Development preview port3002. Local embedded database port55432. Credentials unchanged; never copy credentials into reports. Current screenshots: desktop-homepage.png, desktop-industries.png, mobile-homepage.png, mobile-industries.png in docs/screenshots. Older homepage-1440 and homepage-375 screenshots may show unloaded lazy assets and are not the review captures.

Awaiting owner decisions: approve proposed non-positioning copy; confirm client relationships and project identities/case studies; verify 18-year claim and hosting pricing/inclusions/renewals; Business annual source displays conflicting units, so TBC remains. Confirm reuse of source stock imagery and logo tagline (asset still says Creative Design Agency). No new destinations invented: existing contact/support/client URLs reused.

Assumptions for review: responsive hero crop; desktop service-flow timing and crossfade; word rotation timing; static footer background instead of unverifiable layered reveal; native accessible mobile navigation; source project imagery shown as reference previews rather than verified case studies. No custom cursor or autoplay video. These are review choices, not claims of exact original animation reproduction.

Remaining work: owner visual review and approved content/assets; do not resume CMS or deploy without the next instruction.

