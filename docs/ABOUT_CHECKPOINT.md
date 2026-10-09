# About resume checkpoint — 16 September 2026

## Stopping state

Local implementation and evidence are ready for owner review. **About draft v2 is private; publishedSnapshot is null.** Do not publish, deploy, modify WordPress, connect the footer form, create service routes or start another page. Do not reuse the About visual system elsewhere until the owner approves it.

Local server: `http://127.0.0.1:3000`. Saved preview: `/preview/about` (sign-in required). Studio: `/admin`, Page → About. Review gallery: `docs/about-review/index.html`. Public `/about/` remains 404 until authorized publication.

The homepage baseline was already v18 with identical draft and public content on entry to the owner-save phase. Both hashes remain `263ce41eae1f19ad58eb92cdbb17c7569698837929a148cb9603e561d254b41d`. No homepage content was saved or published by this task. The only planned global visual adjustment is the requested .5px page-grid stroke; shared positions and tint are preserved.

## Files and responsibilities

- `src/schemas/about.ts`: versioned About contract, stable IDs, safe text/media/items, locale/market, section device visibility.
- `src/schemas/content.ts`: About snapshots coexist safely with homepage snapshots; mixed/wrong-page content rejected.
- `src/schemas/homepage-editor.ts`: optional owner project-approval field for shared selected work.
- `src/content/about-defaults.ts`: the approved English starter copy and recovered media references.
- `src/server/content.ts`: authenticated idempotent About initialization; save/restore validation; approved shared projects; draft versus published-source checks.
- `src/server/publishing.ts`: protected atomic publication uses the published shared project source.
- `src/server/media-references.ts`: About media participates in draft/revision/publication protection and usage reporting.
- `src/app/api/cms/route.ts`, `src/app/api/cms/revisions/route.ts`: page-aware reads/revisions and explicit private initialization.
- `src/components/cms/about-editor.tsx`, `types.ts`, `revision-list.tsx`, `src/app/admin/page.tsx`: page selection, bounded About editing, image/focal controls, responsive saved preview and readable revision comparison.
- `src/components/cms/media-picker.tsx`: inspection loading guard prevents a late response from overwriting edited metadata.
- `src/components/sections/internal-page-hero.tsx`: reusable developer-controlled hero geometry and locked brand.
- `src/components/sections/about-page.tsx`, `about-heading.tsx`, `about-image.tsx`, `about-interactions.tsx`: server-rendered composition, coherent accessible heading animation, responsive image references, capability/process enhancements and cleanup.
- `src/components/sections/site-utility.tsx`, `homepage.tsx`, `homepage-header.tsx`: shared utility extraction and optional light/active-link/home-destination header configuration; homepage defaults preserved.
- `src/styles/about.css`, `about-motion.css`: About-only editorial and responsive styling/motion.
- `src/styles/homepage-final.css`: requested shared half-pixel grid texture.
- `src/app/about/page.tsx`, `src/app/preview/about/page.tsx`, `src/app/sitemap.ts`, `next.config.ts`: published-only canonical route, protected nested preview, publication-gated sitemap entry and same-origin preview framing.
- `tests/about.test.ts`, `e2e/about.spec.ts`, `e2e/about-editor.spec.ts`: isolated contract/storage/browser coverage. `e2e/media.spec.ts` adds deterministic delayed-inspection coverage without dropping assertions.
- `docs/ABOUT_BLUEPRINT.md`, `ABOUT_REVIEW.md`, this checkpoint and `docs/about-review/`: source map, report, captures, recordings and evidence JSON.

## Schema and storage

No new database table or migration. The existing Page JSON snapshot architecture stores About schemaVersion 1. A new private Page row `about` was initialized through the authenticated CMS POST, then five reference images entered through normal media uploads. A version-checked CMS PATCH selected their derivative-capable references and produced v2, revision 1 and an attributed draft-save audit. Shared homepage header/footer are referenced, not copied into About fields.

The recovered hero image is temporary, not an assertion of CODEYEA premises or team. About media can be replaced in the existing media library. Each of the four capability slots has an independent reference even where a temporary asset is reused.

## Verification completed

- `npm test`: **38/38 passed**, dedicated codeyea_test role/database; owner database rejected by test guards.
- TypeScript: passed, including fresh production-build type checking.
- Production build: passed; public About, nested preview and sitemap routes compiled.
- Focused browser set: **14 cases passed across the suite and targeted reruns** — 3 About route/responsive/visibility, 1 About editor, 3 dropdown, 1 homepage CMS, 4 homepage correction-3 interaction cases, 1 media, 1 publication. Initial failures exposed accessible-label and media-inspection issues; both fixed and the affected editor/media pair passed on rerun.
- Actual owner preview: all 8 requested sizes, single H1, no horizontal overflow, no broken visible images. Hidden desktop-only media deliberately remains lazy on smaller screens.
- Reduced motion: inline capabilities and zero running capability animations. Server-rendered content verified with JavaScript disabled.
- About public 404/no sitemap entry, private noindex; stale-save and restore/publication isolation covered. Homepage content hashes unchanged.
- Full-page desktop/tablet/mobile visually inspected, plus hero/editorial/process/footer close views. Normal-motion desktop recording ~19.6s and mobile ~28.5s reviewed at representative frames.

Full-page/section stills temporarily neutralize sticky positioning solely for capture. Viewport captures and recordings show the actual interaction. Capture helpers under `.local/about-*.mjs` are local tools, not application routes. Test helpers use isolated .next-test/port3001; owner preview uses .next/port3000. Do not rerun the owner-initialization helper as a generic test.

## Remaining approvals / pre-launch

Owner approval of About design/copy/media and provisional hero entrance timing; temporary media replacement/approval; launch-only permanent redirect from `/codeyea-about-us/`; explicit About publication; final footer delivery and existing production hardening tasks. The supplied video starts below the hero, so it cannot confirm exact hero entrance choreography. No unsupported organization structured-data properties were invented.
