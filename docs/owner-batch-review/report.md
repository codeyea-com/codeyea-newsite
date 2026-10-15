# Owner correction batch, 2026-10-15

Local review: http://127.0.0.1:3011/owner-batch/index.html

## Implemented

- Arabic growth path follows the actual numeral bounds, 01 through 04, including responsive row changes.
- The image-strip checkbox is off in 28 local industry CMS drafts. Published snapshots were not modified. `cms-gallery-settings.json` records affected versions; `scripts/apply-owner-gallery-setting.ts` applies this same reversible change to the selected CMS environment.
- General-page foreground plaques now use the official Digital Innovation Agency logo, stronger shadow and bounded scroll motion. Shared public headers and footers use the same correct brand assets.
- Arabic text uses RTL flow independently of alignment. Industry introduction columns align with the page container without overlapping. The dark proof-band divider moves to the correct side.
- Contextual service links preserve the authored words and point to localized internal pages.
- Eight service routes now use `/services/slug/`, with `/ar/services/slug/` for Arabic. Old flat routes return permanent 308 redirects. Industry and blog URL contracts retain their category parents. No blog posts were invented or published.
- Industry directory image sections extend to the viewport edges. The supplied Corporate reference uses 1.2 scale and vertical parallax; this implementation preserves the scale and movement direction but bounds travel to the available overscan to avoid blank edges at shorter frames.
- The rejected small-business bicycle cover is replaced with a candle-making workshop photograph. Responsive files are registered in the shared catalogue.
- About slide 04 no longer initiates an automatic scroll to the next section.
- Shared priority-service cards use full width and link to the corresponding service. The dark-section heading remains sticky inside its section. Shared service identities, descriptions and icons stay synchronized.
- Twelve interactive hero scenes retain LTR artwork coordinates in Arabic while Arabic copy remains RTL; code and addresses are isolated LTR.
- Mobile language control is positioned between the logo and menu, and the floating mobile control is hidden. Existing language availability rules are retained.
- Photographic frames use cover, including the Website Design collage and About slides. Brand marks, transparent artwork and blueprints retain their functional sizing.
- The case-study index uses the requested wide/small card rhythm, real project categories, pointer-follow label and the measured Website Design zoom treatment. The service list appears immediately before the existing CTA. The seven detail pages retain their approved design.
- Utility links have the white sweep and slight sideways text motion.
- Homepage About uses an edge-aligned half-width image and wider copy column. The review hub shows reference and implementation together.

## Verification

- 27 routing, contextual-link and breadcrumb tests passed, including all 76 breadcrumb paths and all 16 case-study pages.
- Four case-study content/render tests passed.
- TypeScript check passed.
- Actual local HTTP checks: `/website-design/` and `/ar/ai-automation/` return 308 to their new paths; `/services/website-design/` returns 200.
- Browser inspection compared the 12 interactive scenes in both languages, without horizontal document overflow at desktop width.
- Mobile inspection at 390px covered Industries, Services and the case-study index in both languages: the header language link is present and the floating control is hidden, without document overflow.
- Visual checks covered the connected Arabic step line, desktop edge-to-edge cards, sticky service title, revised candle cover, mobile header and case-study grid/filter. Evidence is saved in `evidence/`.

These checks support implementation verification. They do not replace the owner's visual review or imply design approval. This batch has not been deployed or published to the public CMS.
