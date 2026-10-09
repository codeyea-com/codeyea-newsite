> Superseded for header styling, service-copy density and footer composition by [Focused correction pass 2](HOMEPAGE_CORRECTION_2_REVIEW.md). The previous white backing, full-width panels and fallback-only copy choices below are rejected and no longer current.

# Final homepage visual and motion review

16 September 2026. Frontend refinement only; ready for owner review. Local production preview: http://127.0.0.1:3000/. No other page, CMS feature, schema, owner record, publication, WordPress site or deployment was changed.

## Reference comparison

| Supplied reference | Result and deliberate differences |
| --- | --- |
| 01 Services (also the duplicate clipboard image) | Smaller, left-aligned positioning headline with supporting copy directly beneath it; ink/navy typography, open two-row desktop services and two readable mobile columns. Eight coherent 24-unit line icons. Semantic text remains one screen-reader string while visual words stagger up and return with a slower spring-like easing; CTA follows, icon settles last. Item height stays fixed during interaction. Existing approved taxonomy and saved copy remain. |
| 02 Page grid | One faint background grid on the homepage main surface. Services no longer paint individual vertical dividers. Opaque image/portfolio sections intentionally cover the grid. Mobile retains a subtle shared grid without card borders. |
| 03 Who We Are | Wide 1.49:1 landscape image, broader left column, balanced copy gap and smaller heading. Five single-open accordions and existing keyboard/height behavior retained. The existing improved copy stays in saved snapshots; no old WordPress text was restored. |
| 04 Experience | Translucent white panel (80% desktop / 84% mobile), no yellow rule, prominent ink number, connected compact mobile arrangement and shared text-and-arrow CTA. Verification-pending label retained; the 18-year claim was not approved by this work. |
| 05 Service flow | Desktop media fills nearly the usable viewport height and stays pinned while the active narrative changes. Existing GSAP crossfade, current-step label and readable inactive narratives remain. Added outline-plus detail treatment. Where the saved destination is empty, it is non-navigational and exposes “destination awaiting approval” to assistive technology; no link is invented. Tablet/mobile and reduced motion use the readable inline-media layout. |
| 06 Case Studies | Added shadow breathing room around the carousel, retained intro recession/expansion and reversal, vertical titles inside media, removed duplicate visible title/details below, moved square controls within the media at lower-left. Neutral project names/reference disclaimers remain. The pointer says **Drag** when no project destination exists and **Explore** only for a real link. |
| 07 Industries | Native Embla looping in both directions replaces the final-card dead end/reset. Slower overlay/text entrances, unclipped shadow space, synchronized count/progress and centered controls below progress. Existing hover/focus/drag/offscreen/hidden-tab/reduced-motion autoplay pauses remain. Eight approved industries remain, rather than the old reference's eleven. |
| 08 Footer | Restored background image and responsive crops retained. Large phrase left, supporting copy/text action right, navigation and account groups beneath, logo/copyright lower-left. Automatic words and static reduced-motion state retained. No newsletter form was invented; only configured destinations are rendered. |
| 09 Header | Contact/icon left; Support and Client Area/icons together right. Stronger blurred glass, full-width square mega panels, Services/Industries grouping, parent-label/chevron hover, controlled exit, sibling fading and keyboard/touch behavior. Hosting/Work stay direct links because no child destinations are configured. On dark glass, pink active text receives a sharp white backing to preserve contrast; no unverified gradient stop was introduced. |

## Content source and publication boundary

Reviewed the three new English DOCX files in `content/new by chatGPT`: Home/About/Contact, Website Content English, and the Implementation Guide. Selected/normalized their location-neutral service descriptions, service-flow explanations and About summary in the frontend fallback definitions. No unsupported location, client, project, price, award or performance claim was introduced.

Saved CMS snapshots deliberately retain precedence. The current owner publication contains its existing shorter descriptions; this pass does not silently replace them at render time or write new content into drafts/publication. Applying the longer approved source copy to those saved fields is a later explicit editorial action. Hero text/media and Hosting content were retained. Claim/commercial flags and the protected footer asset remain unchanged.

## Evidence

- [Desktop — 1440 px](final-homepage-review/homepage-1440.png)
- [Tablet — 768 px](final-homepage-review/homepage-768.png)
- [Mobile — 390 px](final-homepage-review/homepage-390.png)
- [Desktop interaction recording](final-homepage-review/desktop.webm)
- [Mobile interaction recording](final-homepage-review/mobile.webm)

Full-page screenshots use the readable reduced-motion state and loaded imagery to avoid capturing incomplete entrances. Recordings exercise normal motion: mega-menu traversal and keyboard, service words, pinned service progression, project expansion/reversal/filtering, industry wraparound and mobile drawer/swipe/footer. Captures use the isolated test environment; they do not publish owner content.

## Verification

- 36 integration/unit checks passed, including private draft/media access, publication isolation, permissions, revisions, audit attribution and rollback.
- TypeScript and production build passed.
- Six focused browser checks passed: three header checks, two new final-refinement/evidence checks, and the full homepage CMS/saved-preview regression check. A rapid-Tab menu regression was found and fixed by making open disclosure content immediately tabbable while opacity animates.
- Final CSS-only adjustments corrected a tablet footer grid span and strengthened dark-header active contrast. The five affected homepage/header checks were rerun with refreshed captures; the CMS workflow was unchanged after its passing run.
- No horizontal overflow at 1440, 1280, 1024, 768, 390, 375 and 320 px, plus 812×375 landscape. Mobile services remain two columns; drawer, hosting plan cards/billing, compact experience and project intro collapse remain functional.
- Read-only implementation review found no material binding, pin teardown, carousel-loop or reduced-motion regressions.

Motion timing is a custom implementation of the requested intent, not a frame-exact measurement of the old theme. Physical iOS/Android devices and assistive-technology combinations beyond the Chromium keyboard checks remain unverified. Existing claim, commercial and project approvals still apply.

Stop here for owner review. Do not freeze/reuse the design system on other pages, deploy, publish or resume CMS development without the next instruction.
