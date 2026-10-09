# Homepage focused correction pass 2 — owner review

2026-09-16. This report supersedes the header, service-copy and footer decisions in `HOMEPAGE_FINAL_REVIEW.md`. Local implementation only; nothing deployed, published or changed in WordPress.

## Review location and publication boundary

Open the authenticated [private preview](http://127.0.0.1:3000/preview), or Preview in the homepage editor. The public homepage intentionally retains its saved public copy; the shared presentation fixes apply to both renderers.

The authorized editorial update used authenticated `PATCH /api/cms` with expected version **13**, producing private draft **14**. The existing save transaction created the before-edit revision and `page.draft_saved` audit entry. No direct database mutation, publish endpoint or publication operation was used for owner content. IDs, order, enabled flags, media, locale/market, destinations, hosting prices and the experience approval flag were preserved.

The published snapshot hash stayed `74acb4aac9c0db9c2d54106d1a19659cbe2868444ef9a8b6dfdb9a3ea521d8ca`. See [save evidence](homepage-correction-2/draft-save-evidence.json) for revision/audit IDs.

## What changed

- Desktop navigation has transparent hover/focus/open states with pink text and chevrons, 18px labels, 220ms transitions and 55% sibling opacity. Logo, utility bar and quote CTA do not fade. Removed the rejected white backing rules.
- Both desktop mega menus use a centered 900px white 94%-opacity panel, 32px backdrop blur, navy links, smaller gaps, square corners and a soft shadow. Header frost is on a decorative layer so it does not prevent the panel from blurring the page. Standard blur declarations follow vendor-prefixed declarations so the production build preserves them. Mobile drawer behavior is unchanged.
- Service-flow bodies now contain 122–124 source-backed words each, with paragraphs and compact capability lists where useful. The desktop image remains tall and dominant. Tablet/mobile copy stacks below the image to avoid a short image floating beside a long narrow column.
- A shared plain-text renderer converts blank lines into paragraphs and hyphen-only groups into semantic lists, without HTML injection or a content-schema migration.
- Configured Explore Details actions use one anchor around the circle and label, an ink-filled hover/focus circle, white plus, animated underline, and a slow pointer displacement capped at 3px. Coarse pointers and reduced motion suppress pointer following; keyboard focus remains visible.
- Footer composition now has the large two-line partnership phrase and outlined arrow upper-left, substantial project message and text CTA upper-right, large logo/copyright lower-left, MENU lower-middle, and Keep In Touch plus client/support links lower-right. Existing background image/crops and configured destinations remain.
- The email form has a permanent label, required email semantics, native validation, keyboard focus and a visible disconnected status. It prevents submission and never claims delivery. Controls stay disabled until its client handler is ready, preventing native GET submission before hydration or without JavaScript.

## Editorial audit

Selection is based on `CODEYEA_Services_English.docx`, `CODEYEA_Website_Content_English.docx`, and corroborating `CODEYEA_Home_About_Contact_English.docx` under `content/new by chatGPT/`. The new documents supported the needed details; no old content or invented capabilities were required. The pure selection is retained in `scripts/homepage-pass2-copy.mjs` for review and isolated testing; it was actually saved to the private owner draft, not left as fallback text.

| Area | Draft change / decision |
| --- | --- |
| Hero | Kept concise existing approved positioning, supporting line and animation. |
| Services introduction | Expanded to a useful 63-word introduction about scope and working together. |
| Eight service summaries | Expanded to 36–48 words describing value and supported work, visible without hover. Approved taxonomy retained. |
| Who We Are | Two readable paragraphs, 99 words; all five accordions now have meaningful supporting detail. |
| Experience | Expanded approach/support explanation, 53 words. The unverified 18-year value and pending-verification label remain unchanged. |
| Service flow | Technical support 124 words; branding 124; eCommerce 122. Counts include list markers. |
| Hosting | Expanded concise introduction only. No prices, guarantees or plan inclusions invented. Existing commercial confirmation dependencies remain. |
| Case studies / Industries | Concise browsing copy retained. No invented client/project claims or taxonomy changes. |
| Footer | Source-backed 34-word supporting paragraph plus project heading and CTA. Longer reference-like composition restored. |

## Remaining dependencies and visual differences

**All three owner service-flow destinations are unconfigured:** `technical-support`, `branding`, and `ecommerce` each have an empty `ctaHref` and `ctaLabel`. No service detail routes exist in this app; implemented pages are `/`, `/preview`, `/login`, `/admin`. Empty contracts were preserved. The owner preview therefore displays Explore Details with a visible “Service destination awaiting configuration” note rather than a fabricated URL or silent 404. Live link behavior was verified using an implemented homepage anchor in the isolated test draft. These three actions cannot be called fully connected until destinations are supplied/implemented in their authorized later scope.

**Final pre-launch task:** connect footer email delivery at the end of the website project, select the approved recipient/provider and data policy, then implement and test real delivery and failure handling. This pass adds no API route, provider, recipient, database write, rate limiter or third-party integration.

Compared visually with the supplied WordPress screenshots, the footer now follows the same desktop arrangement, but its longer new English message wraps to more lines. It keeps current configured links (including content studio), omits the outdated Service Areas entry, and uses the current shorter copyright. The lead says “We’d love to build/create/grow together” instead of the reference’s awkward wording. The visible disconnected-form note also adds a line. Service-flow copy uses the approved modern service taxonomy and additional supported maintenance detail rather than the old WordPress-specific wording; the unconfigured-action note remains visible. These are explicit remaining differences, not a claim of pixel-identical reproduction.

## Evidence

- [Normal desktop header, active navigation, 1440 px](homepage-correction-2/header-normal-1440.png)
- [Sticky desktop header and frosted menu, 1440 px](homepage-correction-2/header-sticky-1440.png)
- [Active desktop service flow with pinned tall image](homepage-correction-2/service-flow-active-1440.png)
- [Configured action default](homepage-correction-2/action-default-isolated.png) and [hover](homepage-correction-2/action-hover-isolated.png) — isolated test content, not owner routing.
- [Footer beside supplied WordPress reference](homepage-correction-2/footer-comparison.png), also available as a [standalone comparison](homepage-correction-2/footer-comparison.html).
- [Footer 1440](homepage-correction-2/footer-1440.png), [768](homepage-correction-2/footer-768.png), [390](homepage-correction-2/footer-390.png).
- [Service flow 1440 reduced motion](homepage-correction-2/service-flow-1440.png), [768](homepage-correction-2/service-flow-768.png), [390](homepage-correction-2/service-flow-390.png).

Owner captures use authenticated private draft 14. Section-only captures hide the fixed header/scroll indicator so they do not obscure the section; normal/sticky header and active-flow captures retain the actual chrome. Full reduced-motion section captures include all readable content.

## Verification

- TypeScript and production build pass.
- 36 isolated integration tests pass, including draft/revision/audit atomicity, stale saves, publication isolation and owner-database protection.
- Five focused production-browser tests pass: three dropdown mouse/keyboard/touch tests, complete CMS draft/revision/preview regression, and the new focused correction test.
- Checked transparent top-level and mega-link backgrounds, sibling fade, compact width, actual computed blur, mouse crossing/leave, outside click, Tab/ArrowDown/Escape, touch disclosure and mobile drawer.
- Checked whole configured action target, implemented anchor destination, constrained pointer motion, keyboard outline, reduced motion and coarse-pointer suppression.
- Checked invalid email, truthful non-live submit, absence of email-bearing requests and JavaScript-disabled controls.
- Checked draft version/revision/audit, rejection of a stale save, unchanged public snapshot, private preview access, and no horizontal overflow at 1440/768/390.

Stopped for owner review. No additional page implementation or deployment is authorized by this pass.
