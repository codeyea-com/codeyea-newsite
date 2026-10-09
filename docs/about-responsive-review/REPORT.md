# About — static tablet and mobile review

Desktop static design was approved before this pass. The same seven sections, copy, images and saved ordering remain in place. About is still private draft **3**. No owner content was saved or published in this pass.

## Screenshots

[Review gallery](index.html) · [768px Tablet](about-768.png) · [390px Mobile](about-390.png) · [375px Mobile](about-375.png) · [320px Mobile](about-320.png)

## Changes

- About typography now uses the globally approved `--font-body` token (Josefin Sans), including project text, awards heading and static pagination where the reference previously used other fonts.
- Tablet retains the introduction and experience columns. Principles stack, and the showcase image sits above its copy, following the WordPress responsive composition.
- Mobile stacks the existing introduction, experience and awards columns. Hero, headings and labels scale without clipping; the caption wraps beneath the original experience image instead of reproducing WordPress’s overflow.
- Original project imagery requests a larger existing derivative so the tall narrow crop stays sharp. No asset, media reference or focal-position data changed.
- No animation, pinning, autoplay, parallax or slider behavior was added. Shared header/footer behavior and files are unchanged.

The reference displays additional legacy showcase slides in its responsive flow. This pass retains the one already-approved static showcase and its existing image/copy, in accordance with the explicit instruction not to add sections or change content/images. Static slider pagination is omitted at narrow widths, as in the reference.

## Verification

The saved preview was inspected at **768, 390, 375 and 320px**, with a 1440px desktop regression capture. At every width: viewport and page width match; no overflowing text elements; all four section images load; one H1; all About text uses Josefin Sans; no active About body animation; no browser errors. See [checks.json](checks.json).

Desktop section heights remain the same as the approved static pass. Only the explicitly requested font-family normalization affects its type rendering. Tablet/mobile crops and readable caption placement were reviewed against the live WordPress page. Reference captures are retained under `.local/about-reference/responsive/`.

TypeScript and production build passed. All **6 focused browser tests passed**, including the requested responsive widths, CMS editor preview/restore, shared navigation and media workflow in the isolated test database. Owner homepage/About draft and publication fingerprints were identical before and after capture.

Full-page screenshots retain the real shared header/footer. Only the private status banner was hidden for screenshots. Supplemental isolated section crops hide the shared fixed shell to prevent Chromium from drawing it across tall section screenshots; application behavior was not altered.

## Scope and checkpoint

Application files changed: `src/styles/about.css` and the project image `sizes` hint in `src/components/sections/about-page.tsx`. Responsive regression assertions were added to `e2e/about-static.spec.ts`. No CMS architecture, schema, content, homepage, shared header/footer or image records changed.

Local preview remains available at `/preview/about`. Stop for owner approval of Tablet and Mobile. No publication, deployment or motion work is authorized by this completion.

The capture script’s proposed credential-login fallback was rejected by automatic approval review. It was removed; captures succeeded using the existing authenticated session only.
