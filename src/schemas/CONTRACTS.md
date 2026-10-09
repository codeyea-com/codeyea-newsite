# Homepage content contracts

These schemas prepare content boundaries only. They add no homepage components, animations, database migrations, editors, publishing endpoints, or automatic data conversion.

- `homepage-contracts.ts` covers hero, client logos, positioning, the unified services collection (rendered as two rows), about/accordions, experience, service-flow panels, hosting, portfolio, industries introduction/carousel, footer, and header/global references.
- `collection-contracts.ts` covers services, industries, projects, hosting plans, posts, categories/tags, media, menus, site settings, and redirects. Services and industries accept only the approved taxonomy. IDs remain stable independently of display labels.
- Records/sections carry locale and market identity; ordered content carries explicit position/enabled fields. Media references carry alternative text or an explicit decorative designation. Structured content is plain text with bounded links; raw markup and motion controls are excluded.
- Version 1 snapshots embed collection records to support future immutable publication/revision snapshots. Structural schemas do not resolve references against the database: a future publishing boundary must validate reference existence, kind, locale/market compatibility, asset availability, and required enabled sections before accepting a complete homepage. Sparse snapshots intentionally support the existing foundation page.

`content.ts` remains the live Milestone 1 editor contract and is unchanged. `readHomepageSnapshot` accepts its legacy one-positioning-section snapshot and returns a fresh, recursively frozen version 1 object using caller-provided page/locale/market identity. It preserves section IDs/copy and never adds fictional sections. Existing database snapshots are not rewritten. Explicit unknown schema versions fail closed. Future migrations must be explicit pure transforms and retain readers for stored versions.

Before switching production reads/writes to this contract, add transaction-level integration tests and an explicit migration/publishing design. No such switch is performed here.

Additional content fields preserve reference semantics: service-flow eyebrow/bullets, about video action/highlight words, header quote action, bounded footer newsletter configuration, and hosting billing/discount/featured-plan choices. Newsletter integration IDs are references only; no endpoint or provider secret can be inserted. Hosting checkout URLs require external HTTPS without URL credentials. Plan features have unique IDs and positions plus enabled state.

Media and settings carry ordering/enabled fields. A media record ID and storageKey identify an immutable asset version: never overwrite bytes at that key. Replacing an asset must create a new record/key and preserve old bytes while referenced by a revision. This is a storage integration invariant, not something a JSON schema can enforce.

`revision-contracts.ts` defines future page/post revision envelopes with actor, timestamp, reason, positive version, entity match, and explicit schema version. These do not replace current Prisma revision records. Locale/market definitions reserve direction, default locale, currency, ordering, and visibility. Their availability and cross-record consistency are enforced by a future publishing boundary.
