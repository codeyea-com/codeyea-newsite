# Case-study implementation review — 2026-10-14

Owner approval: “اعتمد تنسيق صفحة تصميم المواقع”. Six existing fictional scenarios, requirements, five separate illustrated stages, then simulated results. No homepage, general service-page redesign, CMS publication or deployment in this batch.

## Reference and implementation

- Exact source: Website Design, `#custom-cms`, the existing `.ccms-heading`, `.ccms-overview`, `.ccms-benefits`, `.ccms-closing` composition. Results reuse its `.e-management-grid`; CTA reuses `.b-contact`.
- Desktop image: 591.917 × 443.938 CSS px, gap 60 px, columns 591.917 / 548.083. Tablet: 415.333 × 311.5. Mobile: 393.333 × 295. All are 4:3, matching the source frames.
- Existing entrance sequence retained: translateY 28 px, 1300 ms, 130 ms stagger, `.16,1,.3,1`, intersection threshold .15. No new animation pattern.
- Intentional content differences: case title and requirements replace service intro; five image/text stages repeat the approved split; three before/after metrics replace service capability cards. Navigation links are provided between the six cases and their language counterparts. The index is a simple two-column list, one column on mobile.
- Sharp page corners, no external popup ornaments on the framed images.
- `review.html` presents source and implementation screenshots side by side. It does not claim the different content is pixel-identical.

## Images

36 selected originals generated using **built-in image_gen**; 4 selected replacements correct a pitched-roof thumbnail, two Velora interface details, and an Atlas geographic address. All 36 have been visually inspected. No geographic company addresses were retained.

- Web assets: `public/site/generated/case-studies/<slug>/<cover|stage-1..5>-v1.webp`.
- Original archive: `C:/Users/grdez/Documents/codex-projects/codeyea/Generated images/case-studies/<slug>/2026-10-14/`.
- Prompt set + measured frame requirements: `docs/CASE_STUDY_IMAGE_PLAN_20261014.json`.
- Selected generation outputs and correction history: `docs/CASE_STUDY_IMAGE_GENERATIONS_20261014.json`.
- Sizes and selected original paths: `docs/SELECTED_CASE_STUDY_ASSETS_20261014.json`.
- WebP output: 6,828,020 bytes across 36 assets. Sharp was used only for encoding/resizing the selected originals; no visual compositing or retouching of generated scenes.

## Verification

- TypeScript check passed.
- Three focused tests passed: bilingual scenario content, 36 unique files and 4:3 images; ordered stages/disclosures/approved motion; all index links in both languages.
- Browser checked all 12 pages at desktop and mobile widths. No horizontal overflow; all 36 images loaded when their stages were visited. Each detail has one H1 and five stages.
- Mobile header is white; quote CTA is fixed with the existing `cy-quote-shine` loop. The modal opens and closes. No form was submitted; concept previews disable live lead submission.
- The inherited shared quote dialog remains English, including when opened from an Arabic page. Its copy was not changed in this case-study batch.
- Representative tablet layout checked without overflow; image dimensions match the reference.
- No console errors were captured during the six Arabic page/stage checks.
- Unauthenticated request to `/preview/case-studies` returns HTTP 401. Runtime route requires `view_admin`; no public case-study route was added. Local static review is noindex/nofollow.

## Rebuild

From the worktree: `node scripts/build-case-study-data.mjs`, `node scripts/build-case-study-art.mjs`, then `node --env-file=.env --import tsx scripts/build-case-study-review.ts`. Art rebuilding requires the local original generation files recorded in the generation manifest.

Review: http://127.0.0.1:3011/case-studies/review.html. Arabic/English indexes and 12 detail files live under `docs/section-imagery-preview/case-studies/`.
