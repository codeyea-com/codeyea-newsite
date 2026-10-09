# Homepage CMS review — 14 September 2026

Ready for owner backend review. Homepage design is frozen; no deployment or WordPress changes. Owner content was not saved or published during testing.

## Review locally

Open http://127.0.0.1:3000/login with the existing local owner credentials. Credentials were not changed. The approved frontend is at http://127.0.0.1:3000/.

1. Select a homepage section in Content. Edit text, links or a registered image. Layout and animation controls are protected.
2. Use collection disclosures to edit, reorder, show/hide, add or remove bounded items. Removal asks for confirmation. IDs survive reordering. Featured projects appear first, followed by their collection order.
3. Save draft. Field validation keeps entered content. Unsaved edits block Preview and Publish; leaving the editor warns.
4. Preview the complete saved draft at Desktop, Tablet or Mobile width, or open its private link. Public content stays unchanged.
5. Inspect Revisions, compare the full homepage fields and restore a previous version as a new private draft. Audit log records actor and action.
6. Publish is available only with publish_pages and only after saving. It validates and publishes the entire saved snapshot atomically, with exact-origin and expected-version checks. Reviewing does not require publishing.

## Delivered

- Twelve ordered editor sections: Header/navigation, Hero, Client logos, Positioning, Services, About, Experience, Service flow, Hosting, Case Studies, Industries and Footer.
- Bounded text, CTA destinations, stable-ID nested collections, locale/market validation, registered media thumbnails/alt/focal controls. No arbitrary page builder or raw HTML/CSS.
- Full draftSnapshot storage alongside the existing publishedSnapshot; legacy positioning drafts/revisions remain readable and restorable. Legacy homepage defaults match the frozen frontend and are materialized on the next explicit save.
- Full saved private preview; permission-controlled publication, publication history, revision comparisons/full reading, audit attribution and transaction rollback.
- Recovered original /homepage/footer.webp restored, with cover sizing and deliberate 50%, 62% and 70% horizontal crops for desktop/tablet/mobile. No extra overlay was needed. Background remains developer-controlled. Existing footer layout and automatic words remain.
- Local Windows database encoding corrected from WIN1252 to UTF8 after checkmarks exposed a JSONB write failure. All 17 tables were copied and compared identically in each local database before switching. Disabled original databases codeyea_win1252_backup and codeyea_test_win1252_backup remain as safety copies. No editorial values or credentials changed. New local databases explicitly use UTF8.

## Evidence

[CMS walkthrough](homepage-cms-review/walkthrough.webm) — isolated test user/data, no owner publication. Briefly demonstrates editing, validation, media selection, collection changes, saved responsive preview and comparison.

| Capture | Link |
|---|---|
| Homepage section list | [Sections](homepage-cms-review/sections.png) |
| Simple editor | [Hero](homepage-cms-review/simple-editor.png) |
| Collection editor | [Services](homepage-cms-review/collection-editor.png) |
| Media picker | [Recovered assets](homepage-cms-review/media-picker.png) |
| Saved preview | [Desktop](homepage-cms-review/preview-desktop.png), [Mobile](homepage-cms-review/preview-mobile.png) |
| Revision comparison | [Comparison](homepage-cms-review/revision-comparison.png) |
| Original footer restored | [Desktop](homepage-cms-review/footer-1440.png), [Tablet](homepage-cms-review/footer-768.png), [Mobile](homepage-cms-review/footer-390.png) |

Footer captures use reduced motion and suppress fixed header overlays only during screenshot capture; the live header behavior is unchanged.

## Verification

- Complete integration suite: **27 passed**. Includes permissions, origin/contract boundaries, save/public isolation, concurrent writers, publication conflicts/history, rollback and restore. Full-homepage tests exercise each section type, stable collection IDs, invalid media/links/pricing, and Unicode including Arabic.
- Complete browser suite: **12 passed**. Covers the existing desktop/mobile five-area/motion behaviors, 320/375/390/tablet/landscape layouts, CMS login/roles, save/publish isolation, complete private responsive preview, media and collection controls, comparison and security boundaries.
- Standalone TypeScript passed; production build passed.
- After final service-flow alt/focal/count and complete-revision-reader corrections: focused full-homepage integration tests **3 passed**, affected homepage/CMS browser checks **2 passed**, then final walkthrough/CMS check **1 passed**. Final production and test builds, including TypeScript, passed. The complete suites were not repeatedly rerun after these scoped corrections.
- Local review smoke: homepage/login HTTP 200; anonymous private preview redirects to login (307).

## Remaining decisions and production hardening

- Confirm the 18-year claim before checking its approval flag. Pricing, annual units, renewals, savings, hosting inclusions, client relationships and project destinations retain their existing review/TBC status; no commercial values were invented.
- New uploads/storage are explicitly deferred. Current picker reuses recovered registered files; production storage needs access control, file validation, processing and backup policies.
- Before production: separate migration/runtime database roles, managed backups and restore drills, secrets/TLS, monitoring, trusted-proxy/per-account throttling, recovery/MFA and stricter nonce CSP. Preview is same-origin authenticated; no public preview token sharing.
- Physical-device Safari/iOS/Android and assistive-technology review remain unverified. Locale/market identities are preserved; a translation-management UI is outside this homepage milestone.
- Dense long hosting collections and revision field labels would benefit from owner usability feedback. Revision/audit payload summarization can be optimized before large production histories.

Stop here for owner review. Do not deploy, publish owner content or start other pages.
