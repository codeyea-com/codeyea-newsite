# Interactive hero first-render correction

Scope: Brand Design and every integrated interactive hero in English and Arabic. Other owner batch changes remain paused while the owner collects the next list.

The response now includes the approved hero scene and its layout class. The retired background/photo is removed from the rendered hero, rather than displayed and then replaced by a client script. The visibility gate and its load/error handlers are removed. Existing client scripts bind interactions to the rendered scene without recreating it. Raw template fallback construction remains available.

Coverage: Website Design, Brand Design, Ecommerce, SEO/GEO, Digital Marketing, Web/Mobile Apps, AI Automation, Technical Support, Website Hosting, WordPress Hosting, Cloud Hosting, Email Hosting and Domains, in both locales.

Validation:

- 52 focused tests passed, including all 26 localized responses on public and preview surfaces, CMS copy/image/link/visibility controls, and existing template/link tests.
- TypeScript check and whitespace check passed.
- Browser checks: one initialized scene per page across all 26 localized previews; no broken hero images or browser errors observed.
- Tested the interactive campaign like, application order, ecommerce selection, automation step, support diagnosis, hosting layer, cloud plan, email compose and WordPress update controls.
- A script-free Brand Design fixture displays the complete new hero without a page script. Retired photos and reveal gates are absent from all tested responses.
- Compared Brand, Website Design and SEO artwork/frame dimensions against the previous renderer at desktop and tablet sizes. Brand mobile dimensions also match the previous renderer. The existing narrow mobile Brand artwork issue is unchanged and belongs to the paused layout work, not this loading correction.
- Preserved all ten edited scripts' existing CMS artwork keys and default values.

Local review: `/owner-batch/index.html`, with the updated application previews. Side-by-side layout comparison: `/hero-first-render/compare.html`. Evidence is in `docs/hero-first-render-review/`.

No CMS publication or production deployment was performed.
