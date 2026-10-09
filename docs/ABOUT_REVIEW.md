# About page — owner review

The local About page is ready as a **private draft, version 2**. Nothing in this work publishes About, deploys the site, changes WordPress, creates service pages, or connects the footer form.

Open `http://127.0.0.1:3000/preview/about` while signed in. In the content studio, select **About**. The public `/about/` route deliberately returns 404 until an owner-authorized publication. The [visual review gallery](about-review/index.html) contains the screenshots and recordings.

## What changed

| Before | Now |
| --- | --- |
| No About page contract or route | Server-rendered About content, public `/about`, canonical `/about/`, protected saved-draft preview |
| Homepage-specific presentation | Shared utility bar, header, drawer, footer and a reusable internal hero; About has its own editorial layout |
| No About editing workflow | Ten stable sections with safe content fields, ordering, enabled state, device visibility, media, alt text and three focal positions |
| No About narrative | Approved English copy in nine enabled sections; optional selected work remains disabled |
| One-pixel shared grid | Half-pixel shared grid at the existing positions and tint, as requested for this next task |

The hero has a locked CODEYEA brand line, one semantic page-title H1, a generous white field, deliberate image overlap and lower breathing room. Who We Are uses a wide editorial split. The point-of-view section is dark and expressive; principles remain open columns. Capabilities use a sticky media field with four advancing narratives on suitable desktop screens and inline media/text elsewhere. Process controls synchronize their active state and progress without autoplay. Markets, ongoing partnership and the final contact CTA complete the page.

The approved copy is saved in the CMS, not confined to frontend fallback constants. Five recovered reference images were registered through the authenticated media upload path, producing private responsive derivatives. Each capability has an independently editable media reference. Initialization and the subsequent expected-version save created audit entries and retained revision 1. No database write bypass was used for owner content.

## Shared content and publication boundary

Header/footer content comes from the shared homepage record: its saved draft in private preview, its published snapshot on the public route. About does not duplicate those editable records. Optional projects must have owner approval, real content, media and a destination; publication validates against published shared project approvals, while editing validates against drafts.

The local homepage was already at **version 18 with matching draft/public snapshots when this pass recorded its baseline**. Those snapshots and its version are unchanged. The project’s approved homepage checkpoint is described as draft 17; this task did not restore, overwrite or republish it. Before/after hashes are in [owner-boundary.json](about-review/owner-boundary.json), with a final independent check in [final-checks.json](about-review/final-checks.json).

## Visual comparison and assumptions

- The supplied hero screenshot governs the white field, oversized thin brand, bold page name, overlap and wide image. The new `About Us` title naturally occupies fewer lines than the reference’s longer demo title.
- The supplied 89.8-second video begins below the hero. Its editorial and open-column rhythm informed the page, but it does not establish hero entrance timing. The restrained 650ms reveal remains provisional for owner review.
- The current hero/workspace and digital-work imagery is **temporary recovered reference media**, not a claim about CODEYEA’s premises, employees or client work. It differs from the office interior in the supplied hero screenshot. Replacement remains available in the CMS.
- No legacy architecture labels, awards, location claims, customer metrics, testimonials or verified 18-year claim were imported. Optional work is absent from the rendered page.
- Desktop full-page stills temporarily make sticky elements static so the complete layout can be inspected. The recordings and viewport captures show the actual sticky behavior. A full-page still cannot show all four capability images simultaneously in the desktop sticky field.
- The thin grid remains continuous on compatible light surfaces; opaque photographic and dark sections cover it intentionally.

## Verification

TypeScript and production build pass. The integration suite passes **38 tests** in the dedicated `codeyea_test` database. **All 14 focused browser cases passed across the final suite and targeted reruns.** Coverage includes About API/private boundaries, the actual editor save/preview/restore workflow, every device visibility setting, keyboard process controls, touch/reduced-motion fallbacks, shared navigation, homepage service CTA/finite carousel, media and publication workflows.

Verification caught and corrected two issues: multiline editor controls needed explicit accessible labels; the shared media picker exposed metadata editing before a pending inspection response completed. A loading guard now prevents that late response from erasing a newly entered alt text. The media test deliberately delays inspection and verifies the guard, then retains its original save/archive/recover assertions. This is a small shared workflow fix, not a CMS redesign.

Visual and image checks cover **1440, 1280, 1024, 768, 390, 375, 320, and 812×375 landscape**. There is one H1, no horizontal page overflow, and no broken visible image at those sizes. Hidden duplicate desktop media remains intentionally lazy on smaller screens. Content remains server-rendered with JavaScript disabled. Reduced motion removes the sticky narrative and running About animations. The public About route remains 404, and the sitemap excludes its private draft.

Evidence includes full-page desktop/tablet/mobile images; hero, editorial, principles, process and footer views; desktop/mobile recordings; CMS section, media, visibility, saved preview and revision comparison images; homepage Services captures; and machine-readable boundary/viewport checks.

## Remaining approval and launch tasks

1. Owner review of the About design, content, temporary media and provisional hero entrance timing. Do not reuse this internal-page visual system elsewhere until approved.
2. Replace or explicitly approve temporary media before production use.
3. At the authorized site launch, permanently redirect `/codeyea-about-us/` to `/about/`. No redirect is activated now.
4. Publish About only on explicit authorization; its sitemap entry then becomes available automatically.
5. Footer delivery remains disconnected. Complete its real delivery integration and production hardening at the final pre-launch stage.

No service destinations or external services were connected. The final CTA uses the existing configured contact destination, currently the shared local footer contact area.
