# About desktop static reconstruction — 16 September 2026

Private About draft **3**, saved from version 2 through the authenticated CMS save path. The previous snapshot is retained in revision history; expected-version and audit protections remain active. About is unpublished and `/about/` remains unavailable publicly. Authenticated review: `/preview/about`.

## Reference and implementation

The WordPress page and supplied hero reference were treated as binding layout references. The source full-page JPG is damaged below the service showcase; the live WordPress page supplied the complete lower reference. Both comparison captures use a 1440 × 1000 viewport.

The rejected About body was replaced by the reference sequence:

1. CODEYEA / About Us hero with the original wide office image.
2. Two-column agency introduction.
3. Pale experience section with its portrait, vertical caption and two lower paragraphs.
4. First project image, overlaid title and four vertical category labels.
5. Centered statement and three open principle columns.
6. First service showcase image, text and static pagination presentation.
7. Awards reference columns.

The original four images were recovered from WordPress and uploaded through the existing private media library. The PNG's unsupported metadata was stripped without changing decoded image pixels. No substitute images were used. Original URLs are retained in `.local/about-reference/resources.mjs`.

The WordPress claims, awards and demo text are **temporary owner-authorized visual reference copy**, not approved factual CODEYEA content. They require replacement before any publication.

## Direct visual comparison

Open [the comparison](index.html), [full-resolution side-by-side](side-by-side-1440.png), [WordPress capture](wordpress-1440.png) or [local capture](about-1440.png).

The measured introduction, experience, project, principles, showcase and awards boundaries align within approximately 0.25 CSS pixels at this viewport. Typography, paragraph rhythm, column widths and image cropping were inspected against the reference, not inferred from passing tests.

Deliberate differences required by the owner: the bold hero says **About Us**, the approved shared header/footer and page texture are retained, and the project/showcase remain on their first static frame. The shared footer has different approved copy and height from WordPress. Its existing behavior was not changed. The body has no animation controller, pinning, autoplay, slider or parallax. The scroll decoration and pagination are static; the showcase action is visual-only in this layout pass.

This is not a claim of pixel identity: the image pipeline uses local responsive WebP derivatives, and minor rasterization/crop differences remain possible. Desktop visual approval is pending. Tablet/mobile layouts and motion were not refined in this pass.

Capture method: only the private status banner was hidden for comparison. Actual footer screenshots were stitched at each body’s document end to compensate for Chromium omitting fixed reveal footers in full-page captures. Neither site's footer was redesigned or altered for the capture.

## Verification

- TypeScript and production build: passed.
- Integration suite: **38 passed**, including private save, stale-save rejection, legacy revision restore after a version-2 reference snapshot, audit attribution and publication isolation.
- Focused browser suite: **6 passed**, covering the static About body, CMS editor save/preview/restore, shared navigation mouse/keyboard/touch behavior, and media workflow.
- 1440px render: one H1, all four body images loaded, seven saved sections, no horizontal page overflow, no body animation hooks or active animations.
- Owner homepage version 18 and draft/public fingerprints unchanged; About published snapshot remains null. See [boundary evidence](boundary.json) and [render checks](render-checks.json).
- Tests used the dedicated `codeyea_test` database. Ports 3001 and 3002 belonged to other local applications; the browser suite used free test port 3107. Neither other application was stopped.

## Files and storage changes

- `src/components/sections/about-page.tsx`, `src/styles/about.css`: static reference body and scoped desktop styling.
- `src/components/sections/internal-page-hero.tsx`, `about-image.tsx`: static hero markup and correctly sized hero image derivative.
- `src/schemas/about.ts`: version-2 seven-section contract, retaining version-1 snapshot validation.
- `src/components/cms/about-editor.tsx`: reference section names, media, captions and bounded collections; existing order/enable/device controls retained.
- `src/server/content.ts`: selected-work validation remains active for legacy snapshots; the reference contract does not require a selected-work section.
- `tests/about.test.ts`, `e2e/about-static.spec.ts`: reference snapshot/revision and static browser coverage.
- `scripts/test-environment.ts`, `src/server/env.ts`, `playwright.config.ts`: optional dedicated test port with the same isolated database/role and loopback enforcement; owner port 3000 is excluded.
- Four private media records and one About draft revision/save. **No database migration.** No homepage/shared header/shared footer source edits.

## Resume checkpoint

Local production preview is running at port 3000. About draft 3 is the desktop review candidate. Earlier `docs/about-review` material describes the rejected design and is superseded by this folder. Do not resume its motion or responsive plan.

Next action requires owner desktop design review. Do not publish, deploy, activate redirects, modify WordPress, connect forms, replace copy, begin responsive refinements or start motion work without the next explicit instruction.
