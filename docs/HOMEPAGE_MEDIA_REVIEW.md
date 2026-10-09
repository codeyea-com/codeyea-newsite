# Homepage/backend final review — 15 September 2026

Ready for owner review. No deployment, WordPress edits, owner upload/publication, or changes to retained database backups. The frozen frontend remains intact apart from the requested desktop dropdown behavior correction.

## Review

Open http://127.0.0.1:3000/login with existing local owner credentials. Credentials are unchanged.

1. On desktop, hover the Services label or chevron, move into the dropdown and between links, then leave. The panel closes after a 180 ms crossing allowance. Keyboard focus keeps it usable; Escape, outside click and touch disclosure operation remain.
2. In Content, choose a homepage section and Choose image. Upload JPEG, PNG or WebP, inspect the preview/details, and edit default alt text and focal position.
3. Use image copies the chosen reference/defaults into the current editor. Other unsaved homepage edits remain. Save draft, then Preview at desktop/mobile widths. The public homepage and uploaded image remain private until an explicit authorized publication references the image.
4. Reopen the image details to see which saved/published homepage sections use it. Replace references in drafts before archiving an unused upload. Archived uploads can be recovered. Current or historical publication references prevent archival.
5. Search large collections, inspect compact item summaries, and compare revisions using readable field labels. Unchanged fields and full recovery JSON are separate expandable views.

[Backend walkthrough](homepage-media-review/walkthrough.webm) shows isolated upload, metadata, recovery, selection, private preview, usage protection and revision/publication readiness. Publication is deliberately not performed in the recording.

| Evidence | Capture |
|---|---|
| Upload and details | [Image details](homepage-media-review/upload-details.png) |
| Full saved draft | [Desktop preview](homepage-media-review/private-preview.png), [Mobile preview](homepage-media-review/mobile-preview.png) |
| Reference protection | [Usage details](homepage-media-review/usage-protection.png) |
| Readable revisions | [Comparison](homepage-media-review/readable-revisions.png) |
| Existing full editor walkthrough | [Homepage CMS](homepage-cms-review/walkthrough.webm) |

## Implemented

- Whole-parent desktop dropdown hover, gap crossing, delayed leave, keyboard/touch/outside-click handling and synchronized chevron/color/ARIA. Open content becomes immediately tabbable while its opacity/transform entrance continues.
- Authenticated binary upload with exact-origin checks, manage_media, ten attempts per account per ten minutes, and at most two processing jobs per server process. Upload progress and errors preserve homepage edits.
- Actual JPEG/PNG/WebP container validation, signature and trailing-content checks, restrictive metadata/container handling, rejection of SVG/animation and detected executable/script/polyglot payloads. Originals are never stored or served: decoding and fresh WebP encoding remove unnecessary metadata; EXIF orientation is applied.
- Limits: 8 MiB, 16–8192 px per side, maximum 24 megapixels. Thumbnail/small/medium/large derivatives fit inside 320/640/1280/1920 px without upscaling. Filename normalization and UUID storage keys prevent path injection/name collisions.
- Media records preserve stable ID, original input MIME/size and oriented dimensions, sanitized filename, alt/focal defaults, creator, timestamps, version, derivative metadata and archival status. Served derivatives are WebP. Updating defaults never changes existing saved/published reference metadata or bytes.
- Private storage-provider interface with a local adapter under .local/media; tests use .local/test-media. Checked delivery routes authorize CMS access or require a current published snapshot reference. Responses are no-store and nosniff.
- Upload/update/archive/recovery audit attribution. Storage/audit failure compensation removes staged files. If cleanup itself fails, a durable CLEANUP record can be retried. Interrupted PENDING records become manually eligible for cleanup after one hour.
- Save/publish reference validation and archive checks share a transaction lock. Draft references and all publication snapshots protect files; revision-only assets can be archived and recovered before restoration. There is no permanent-delete UI.
- Compact collection summaries, search for collections with six or more items, human-readable comparison labels, unchanged-field summaries and raw recovery snapshots. IDs/order/legacy revision compatibility remain intact.

Recovered originals remain read-only reference assets in the picker; per-homepage alt/focal editing still works. The new uploaded-asset library supports metadata management and archival/recovery. The original footer background remains excluded from replacement and deletion.

Implementation references: [Sharp metadata](https://sharp.pixelplumbing.com/api-input/) and [output behavior](https://sharp.pixelplumbing.com/api-output/). Validation/limits are CODEYEA policy, not claims of a general-purpose malware scanner.

## Verification

- Complete integration suite: **36 passed**.
- Standalone TypeScript and production build: **passed**; final builds also included TypeScript.
- Complete browser suite ran once: **14 passed, 2 exposed regressions** (a discrete-visibility keyboard delay and recovered-image accessible-name compatibility). Both were corrected.
- Focused production recheck: dropdown hover/keyboard/touch and media workflow **4 passed**. The legacy CMS test then needed its save-status selector scoped to distinguish the new collection-search status; the final CMS/search/revision/recovery check **passed**. No known failing checks remain. The complete suite was not repeated after these scoped fixes.
- Coverage includes auth/origin/role rejection, format/size/dimension rejection, duplicate names, metadata/version checks, quotas, media isolation, published-history protection, archive/recovery, actor audit, storage/audit rollback and durable cleanup retry, plus the existing full homepage motion and draft/publish workflows.
- Both retained WIN1252 database backups remain. The owner media table was verified empty after testing. Only the additive media schema migration was applied to the owner database; test fixtures were isolated and cleaned up.

## Production hosting decisions still required

Choose the durable object-storage provider and credentials/access policy, deployment filesystem/runtime model, backup/retention policy and CDN/delivery strategy. Implement that provider behind MediaStorage; CMS components do not need rewriting. No paid provider was selected or configured.

Existing launch hardening remains outside this local milestone: HTTPS/secrets, restricted runtime database roles, backup/restore drills, monitoring, trusted-proxy/account login throttling, recovery/MFA and stricter CSP. Physical-device and assistive-technology review is not claimed. Existing commercial TBCs and claim/client approvals remain unchanged.

Stop for final homepage/backend review. Do not deploy or publish owner content.
