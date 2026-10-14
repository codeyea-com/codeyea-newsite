# Light hero photography and Arabic overlap

Owner reference: `codex-clipboard-f3056b56-96ca-4fa9-b1f7-2b9601a2d2f8.png`, green line through the Arabic Technical Support title. Owner clarified that the photographs themselves must be replaced with naturally light scenes, without a whitening filter or overlay.

Implemented:
- 32 new responsive assets across 16 photo placements: 14 industry heroes with desktop/mobile compositions, About with desktop/tablet/mobile, and the native Technical Support team photograph.
- Original generated PNGs retained in `Generated images/<page>/hero-light-2026-10-14/`; selected WebP files total 6,367,994 bytes.
- Arabic artwork begins inside the final title line, with natural wrapping retained. Hero media stays 363 CSS pixels tall.
- Light upper areas are part of each photographed environment. No whitening overlays or color filters were added. The previous dark Support image treatment was removed.
- The native Cloud Hosting scene uses a light base palette; its existing layout and animation are retained.
- Temporary industry heroes inherited from another sector now resolve to the proper sector asset, including Arabic snapshots. Non-temporary custom CMS uploads retain priority.
- About, Services, Industries, Contact and the 13 native service hero compositions were reviewed. Existing light general-page heroes remain in place. Case-study titles sit outside their cover images and required no hero overlap treatment.

Verification:
- `npm run typecheck`: passed.
- 15 focused tests passed: general artwork, hero integration, catalogue synchronization and temporary/custom industry hero regression coverage.
- Browser checks: all 14 industry desktop heroes in both languages and all 14 Arabic mobile heroes loaded the new appropriate assets, without image filters or horizontal overflow.
- Arabic overlap measured about 16 CSS pixels on desktop and 9 pixels on mobile; long mobile headings retain two natural lines.
- About tablet English, Technical Support Arabic and Cloud Hosting Arabic were visually checked. Support replay resets to stage 0, with its existing progression retained; Cloud connector animation remains active.
- Runtime `site-templates` assets and their source review files are synchronized.
- The published Arabic Support page exposed a saved-CMS source-identity conflict during deployment verification. The canonical source reference now remains stable; the reviewed default photo is applied after CMS overrides in the asset response. Strict identity validation remains intact. Nine additional template-control checks passed, including saved-reference and custom-upload coverage.
- No CMS content or draft publication was performed.

Local review: http://127.0.0.1:3011/hero-light/index.html
The owner reference and implementation screenshot are shown beside each other. Viewport sizes differ, so the comparison demonstrates the requested overlap rather than claiming pixel-identical screenshots.

Generation provenance: `HERO_LIGHT_GENERATIONS_20261014.json`.
Selected files and dimensions: `SELECTED_LIGHT_HERO_ASSETS_20261014.json`.
