# Initial publication verification

Verified on 2026-09-19 with Node.js 24.15.0 and isolated headless Chrome on macOS.

- Content validation: one published mechanic, complete English, Russian, Simplified Chinese, Hindi, Bengali, Spanish, Arabic, and Japanese lessons.
- Node suite: 20 tests covering charge commitment, body clearance, swept hit detection, recovery, the tank and monster illustrations, design-focused teaching, generic boss/player labels, safe markup, schema failures, translation parity, source-version freshness, draft acceptance, and required 2D/3D YouTube references.
- Browser suite: 11 tests covering all locale routes, the compact two-column lesson header, the stacked 375 px layout, six external boss-fight references per locale, language switching, Arabic direction, both animation outcomes, keyboard playback/seeking, quiz feedback, reduced-motion behavior, and content without JavaScript.
- Static build: 17 pages, local assets, canonical/alternate links, sitemap, and a language gateway.
- Visual inspection: Russian and Arabic desktop pages, Hindi and Bengali mobile pages, the Russian catalog, and the setting-neutral boss/player diagram.
- Contributor scaffold: generated and validated a disposable draft, then removed it.

GitHub Actions repeats content, build, and Chromium browser checks before the Pages deployment. The separate pull-request workflow also checks formatting and has read-only permissions. Initial translations remain `needs-review`; structural tests and this visual check do not replace independent fluent-speaker review.
