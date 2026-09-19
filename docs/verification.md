# Initial publication verification

Verified on 2026-09-20 with Node.js 24.15.0 and isolated headless Chrome on macOS.

- Content validation: one published mechanic, complete English, Russian, Simplified Chinese, Hindi, Bengali, Spanish, Arabic, and Japanese lessons.
- Node suite: 24 tests covering charge commitment, body clearance, swept hit detection, recovery, the tank and monster illustrations, design-focused teaching, generic boss/player labels, safe markup, schema failures, translation parity, stable design-lens IDs, source-version freshness, draft acceptance, the community call to review facts, concepts, examples, and translations, required 2D/3D YouTube references, exact timestamps for videos longer than three minutes, and learning sources spanning design, animation, accessibility, and implementation.
- Browser suite: 11 tests covering all locale routes, the compact two-column lesson header, the stacked 375 px layout, six design lenses, six external boss-behavior references, seven learning sources, and the community review note per locale, removal of the quiz block, language switching, Arabic direction, both animation outcomes, keyboard playback/seeking, reduced-motion behavior, and content without JavaScript.
- Static build: 17 pages, local assets, canonical/alternate links, sitemap, and a language gateway.
- Visual inspection: Russian and Arabic desktop pages, Hindi and Bengali mobile pages, the Russian catalog, and the setting-neutral boss/player diagram.
- Contributor scaffold: generated and validated a disposable draft, then removed it.

GitHub Actions repeats content, build, and Chromium browser checks before the Pages deployment. The separate pull-request workflow also checks formatting and has read-only permissions. Structural tests and visual checks do not establish factual accuracy, validate design concepts, or replace expert and independent fluent-language review.
