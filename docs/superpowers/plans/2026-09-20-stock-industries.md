# Stock media and private industry drafts implementation plan

**Goal:** Authenticated dual-provider discovery and secure imports, followed by ten private industry pages using Roofing draft 5 unchanged as their design template.

**Architecture:** Server adapters normalize provider data; authenticated endpoints expose metadata and locally proxied previews. A durable 24-hour cache holds search results. Explicitly confirmed imports use the existing media validation, derivative, archive and audit pipeline. Industry records reuse the existing detail renderer.

**Constraints:** Never disclose secrets, publish, deploy or replace owner media. No automatic stock selection. Preserve existing page content and approved motion. New stock remains temporary.

- [x] Check key existence only and Git exclusion.
- [ ] Implement `src/server/stock/{contracts,transport,pexels,pixabay,service}.ts`; test normalization, query encoding, missing keys, failure isolation, timeouts and rate limits.
- [ ] Add durable search cache and source metadata with provider/file dedup constraints; extend existing upload transaction without bypassing validation, audit or archive protections.
- [ ] Add authenticated stock search/preview/import endpoints and explicit selection/confirmation interface in MediaPicker. Keep all image requests local; source links open provider pages deliberately.
- [ ] Verify real searches; present candidates for editor selection. Import one selected image from each provider; verify derivatives and persisted metadata.
- [ ] Read all ten industry DOCX sources. Generalize bounded industry identity and routes while preserving Roofing draft 5. Save independent drafts through authenticated CMS.
- [ ] Run integration/browser tests, TypeScript, production build and secret-exposure scan without printing secrets.
- [ ] Capture each draft at 1440/1024/768/390/320, desktop/mobile review images, two representative motion recordings and CMS provider evidence. Report actual outstanding approvals only.

Execution continues in the current authorized workspace. Image selection is a required editorial decision; all independent work proceeds while it is pending.
