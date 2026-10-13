# Website Design: Custom CMS and AI feature

Completed 2026-10-13 for Arabic and English. The new section follows the existing website management section and precedes payments. Existing copy, artwork and section order are preserved.

## Content and imagery

- Practical benefits: business-specific fields, everyday editing, team roles and integrations.
- Technical explanation: structured content, APIs, permissions, revisions, recovery and handover.
- Special Features: an optional AI website assistant accepts a page edit and photo-album request, performs the update and returns a success message and page link. Copy distinguishes simple updates in seconds from larger uploads or reviewed work.
- Three image placements per language: a desktop CMS with laptop preview, a portrait tablet showing editorial review, and the localized AI chat on a laptop.
- Four generated originals use the built-in image generation tool. No crops, stretching or padding were applied. Optimized WebP delivery files total 597,062 bytes across both languages.
- Originals and optimized copies: `Generated images/website-design/custom-cms-2026-10-13/` in the primary workspace. Exact prompts, measured desktop/tablet/mobile frames and output paths are in `CUSTOM_CMS_IMAGE_PLAN.json`, `CUSTOM_CMS_GENERATION_RECORDS.json` and `CUSTOM_CMS_SELECTED_ASSETS.json`.

These are service capabilities and illustrative device interfaces. This change adds marketing content; it does not implement or activate a customer-facing AI agent.

## Existing motion and CTA behavior

The new section joins the existing `commerceMotion` observer: 28px vertical entrance, 1300ms duration, 130ms child stagger and `cubic-bezier(.16,1,.3,1)`. Reduced-motion behavior remains the existing observer's behavior. No new animation engine or motion pattern is introduced.

Both CTA buttons reuse `b-btn` and `data-quote-open`: the existing 0.8s hover/focus lift, existing color/shadow transition and arrow movement, and the existing project quote panel. Their labels are localized. No form was submitted during verification.

## Verification

- TypeScript check passed.
- `verify-custom-cms-section.ts` passed for both locales, one-time insertion, asset existence, localized chat imagery, existing animation timing and both quote actions.
- Existing selected-imagery verification passed: 212 assets, four services, CMS image overrides and small-card treatment preserved.
- Browser reviewed Arabic and English, desktop at 1422 CSS px, tablet at 911 CSS px, mobile at 390 and narrow mobile at 360 CSS px. No horizontal overflow observed in tested viewports.
- Both CTAs opened the existing quote dialog. Images loaded in the reviewed sections.
- Private review: `/custom-cms-review/index.html` on port 3011. Direct page anchors: `/application-concepts/website-design-ar.html#custom-cms-ai` and the English equivalent.
- Screenshots are saved in `docs/custom-cms-proof/`.

Technical source checks: [access control](https://payloadcms.com/docs/access-control/overview), [versions and drafts](https://payloadcms.com/docs/versions/overview), [REST API](https://payloadcms.com/docs/rest-api/overview). These support the capability descriptions; no CMS vendor selection is implied.
