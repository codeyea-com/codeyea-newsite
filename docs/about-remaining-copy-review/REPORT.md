# Remaining About content — private draft 9

Saved through the authenticated CMS with expected-version, revision and audit safeguards. No publication or deployment. No source code, schema, design, typography, spacing rules, image selection or interaction changes.

## Applied

- Project Image Field: supplied section text in the existing kicker position, overlay title and four category labels. Stable IDs and temporary images retained.
- Centered statement: supplied heading; supplied body saved in the existing section body field.
- Three Principles: all three exact titles and bodies.
- Showcase 01–03: exact kickers, titles, bodies and CTA labels. Also replaced the obsolete single-slide fallback fields so the private draft no longer stores their demo metric/copy. Slide 04 is byte-for-byte unchanged.
- Final columns: supplied section label and heading; Clarity, Craft and Reliability titles/bodies in the three existing items. Removed the fake award lists.
- Hero, Introduction, Experience, homepage and published snapshot verified unchanged.

## Unsupported fields / rendering gaps

1. **Centered statement body:** the CMS field exists and contains the exact copy, but the approved renderer displays only the heading before the principles. The body is not visible.
2. **Final section label HOW WE WORK:** saved in the existing label field, which this layout does not render.
3. **Clarity, Craft and Reliability titles:** saved in existing item-title fields; this layout renders only item bodies as lists, so these titles are not visible.
4. **Partnership title/body:** no fourth item slot exists. The final section is one heading column plus three list columns; the schema caps it at three items. Partnership was not inserted elsewhere, merged into another column or added by changing the schema. Its exact pending copy is retained in `boundary.json` for review.

## Verification and visual findings

- Full-page captures at 1440, 768, 390 and 320px; section order matches the saved page.
- No horizontal page overflow. All About images loaded. Inspected complete desktop composition and narrow-screen Project Image Field wrapping.
- Four project categories respond to keyboard/touch. Four Showcase controls work; section height stays stable while switching; CTAs remain non-navigational buttons.
- Normal Showcase transition remains 1 second, CSS ease. Principles retain the turquoise hover state. Reduced-motion slider duration is zero.
- Copy was not shortened. Longer headings wrap more deeply in the unchanged columns. Automatic section heights therefore differ from previous copy: Showcase is 1000px desktop, approximately 1400px at 768, 1263px at 390 and 1288px at 320. Exact earlier tablet/mobile pixel heights are not preserved by the existing auto-height layout.
- Visible fake awards, metrics, architecture-demo category titles and obsolete Showcase filler were replaced. The earlier three editorial sections already contain the approved location-neutral copy. Internal stable identifiers and temporary image descriptions are not business claims and were retained.

The unsupported fields and content-driven height differences prevent claiming that every requested field is visibly complete with unchanged pixel dimensions. They are reported rather than changing the approved design. Stop for owner review.
