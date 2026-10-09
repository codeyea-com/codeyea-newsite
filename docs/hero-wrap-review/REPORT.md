# Shared internal Hero wrapping correction

The mobile title-wrapping issue is resolved. All content and draft versions are unchanged. Nothing was published or deployed.

## Exact implementation

Only two application files changed:

- src/components/sections/internal-page-hero.tsx: detects a whitespace-delimited word of 10 or more characters and adds internal-hero-title-long-word. The title string, H1 semantics, existing About line break, markup, media and motion remain intact.
- src/styles/about.css, existing max-width:767px rule: internal-hero-title now sets overflow-wrap:normal; word-break:normal; hyphens:none. The long-word sizing tier uses font-size:clamp(44px,14vw,91px). The existing line-height:1 remains unchanged. Other titles retain clamp(56px,18vw,91px).

Long-word titles render at 54.6px on 390px screens and 44.8px on 320px screens. Font family, weight, color, letter spacing, image dimensions and overlap rules are unchanged. No title is rewritten, truncated or hidden; no fixed height was added.

## Verification

- 65 Hero checks: all ten new industries plus Roofing, About and main Industries at 1440, 1024, 768, 390 and 320px.
- All 39 desktop/tablet Hero captures at 1440, 1024 and 768px are pixel-identical to the pre-change captures.
- Every word occupies one line at every checked width. E-Commerce stays intact. No title or horizontal page overflow, clipped word, hidden title or increase in Hero height.
- The six named titles—Fashion and Lifestyle, Event Coordinators, Oil and Gas, Online Magazine, Small Business and E-Commerce—were explicitly inspected at both 390 and 320px. Healthcare and Construction were also checked.
- 52 additional normal-motion/no-JavaScript mobile checks passed. Title geometry remains stable after scrolling away and returning. Reduced-motion checks are included in the 65-capture matrix. Existing title markup and motion controllers were preserved; no per-word animation or new controller was introduced.
- 59 integration tests, TypeScript and production build passed. All saved draft versions and protected content/publication snapshots are unchanged.

## Review files

Long-title comparison sheets: long-titles-390.png and long-titles-320.png. checks.json contains exact sizes and whole-word bounds. fallback-checks.json contains the normal-motion/no-JavaScript checks. Each internal page has five individual Hero captures. The stock-industry-review full-page captures were refreshed at all five widths for all ten new pages.
