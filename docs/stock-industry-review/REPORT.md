# CODEYEA stock integration and private industry review

20 September 2026. All ten industry pages are private drafts. Nothing was published, deployed or committed. Roofing private draft 5 remains the template and is unchanged.

## What is ready

- The existing media picker now offers Search free stock, All/Pexels/Pixabay filters, editable keywords, orientation, controlled load-more, preview, alt text and explicit import confirmation. No first result is automatically imported or selected.
- Separate server adapters normalize both providers. Search, preview and import use authenticated CODEYEA endpoints. Pixabay search responses are cached for 24 hours in PostgreSQL; provider failures remain independent.
- Downloads use host allowlists, timeouts, streamed size limits, MIME/extension/decoded-dimension checks and the existing strict image validator. HTML, SVG, executable and unexpected payloads are rejected. Imported media uses the existing private storage and four WebP derivatives; crop, focal position, archive, recovery and audit behavior remain available.
- Provider identity and file hashes prevent duplicate stock imports. Source pages, contributors, original/imported dimensions, date, query and temporary-stock status are retained. Expiring download URLs are not stored as production media sources.
- 20 distinct temporary stock assets were selected under the owner's delegated selection instruction. Both Pexels and Pixabay imports succeeded. No owner-supplied image was replaced and no photograph is shared between different new industries.
- Every page uses its corresponding DOCX as the primary content source and the unchanged Roofing section order, frames, styles, responsive rules and motion components. Content, imagery, alt text, FAQs, Growth Path wording and SEO are independent editable records.

## Drafts and captures

| Industry | Private version | Full-page captures |
|---|---:|---|
| Healthcare | 2 | [Desktop](healthcare-1440.png) · [Mobile](healthcare-390.png) |
| Construction | 2 | [Desktop](construction-1440.png) · [Mobile](construction-390.png) |
| E-Commerce | 2 | [Desktop](e-commerce-1440.png) · [Mobile](e-commerce-390.png) |
| Small Business | 2 | [Desktop](small-business-1440.png) · [Mobile](small-business-390.png) |
| Event Coordinators | 2 | [Desktop](event-coordinators-1440.png) · [Mobile](event-coordinators-390.png) |
| Legal | 1 | [Desktop](legal-1440.png) · [Mobile](legal-390.png) |
| Online Magazine | 2 | [Desktop](online-magazine-1440.png) · [Mobile](online-magazine-390.png) |
| Oil and Gas | 2 | [Desktop](oil-and-gas-1440.png) · [Mobile](oil-and-gas-390.png) |
| Real Estate | 2 | [Desktop](real-estate-1440.png) · [Mobile](real-estate-390.png) |
| Fashion and Lifestyle | 2 | [Desktop](fashion-and-lifestyle-1440.png) · [Mobile](fashion-and-lifestyle-390.png) |

## Verification

- 59 integration tests passed, including stock normalization/search, missing keys, safe rate-limit errors, authentication/permissions, input validation, query encoding, provider isolation, 24-hour cache, secure downloads, duplicate IDs/hashes, metadata, WebP derivatives, archive/recovery/audit, independent draft initialization, stale saves and revision restore.
- TypeScript and production build passed.
- All 50 page/width combinations passed at 1440, 1024, 768, 390 and 320px: one H1, no horizontal overflow, no broken images, no hidden reduced-motion copy and completed Growth Path state.
- All ten pages passed no-JavaScript readability/native FAQ, touch FAQ, keyboard activation/focus, reduced-motion controls and public/private isolation. Public detail URLs return 404 while the new pages are unpublished; anonymous private previews redirect to login.
- Healthcare and Construction desktop/mobile recordings cover text entrances, gallery controls, fixed-frame inner-image scroll travel, image hover, ordered Growth Path, FAQ controls and CTA states. Frame geometry stayed fixed, image coverage stayed complete, mobile image travel stayed zero and numbers activated only after their connecting line completed.
- Homepage, About, main Industries and Roofing saved snapshots, publication snapshots and versions match the baseline. Protected shared component hashes are unchanged. No new page-specific motion controller or stylesheet was introduced.
- Both provider variables were confirmed present without displaying their values. .env.local is ignored by Git. The final security scan checks actual key values against client build files, review artifacts and local logs. The CMS network check recorded zero remote provider/image requests from the browser. See security-check.json for the final scan count and findings.

## Genuine differences and unresolved review items

1. RESOLVED: Mobile Hero titles now wrap at normal word boundaries through the shared component. The narrowly scoped responsive correction and all 65 Hero captures are documented in [Hero correction review](../hero-wrap-review/index.html). Desktop/tablet pixels remain unchanged.
2. All selected stock remains temporary and requires owner approval. The staggered strip repeats differently focused crops of the same industry photograph, following the Roofing template; these are illustrative stock, not client projects.
3. Pixabay's standard large-image response supplies approximately 1280px assets. The existing media pipeline generates WebP, not AVIF, and does not upscale small originals.
4. Unconfigured service/industry destinations remain inactive. Existing contact actions use https://codeyea.com/contact/. No missing routes were invented or activated.
5. Pixabay has no native square filter; Square returns near-square results (0.9–1.1 aspect ratio), as explained in the picker.

## Evidence

- [CMS with both providers](cms-both-providers.png), [preview and confirmation](cms-preview-confirmation.png)
- [Pexels imported metadata](pexels-import-metadata.png), [Pixabay imported metadata](pixabay-import-metadata.png)
- [Healthcare desktop](healthcare-motion-1440.webm), [Healthcare mobile](healthcare-motion-390.webm)
- [Construction desktop](construction-motion-1440.webm), [Construction mobile](construction-motion-390.webm)
- page-checks.json, fallback-checks.json, motion-evidence.json, cms-network-check.json, private-draft-evidence.json, security-check.json

Official API references: https://www.pexels.com/api/documentation/ and https://pixabay.com/api/docs/.

## Subsequent Hero correction

The shared Hero component and its mobile CSS were updated after the original integration checkpoint. This is the only intentional change to the previously protected shared presentation. All industry full-page screenshots have been refreshed at five widths. See ../hero-wrap-review/REPORT.md.
