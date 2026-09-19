# Initial publication verification

Verified on 2026-09-19 with Node.js 24.15.0 and isolated headless Chrome on macOS.

- Content validation: one published mechanic, complete English, Russian, Simplified Chinese, Hindi, Bengali, Spanish, Arabic, and Japanese lessons.
- Node suite: 16 tests covering charge commitment, body clearance, swept hit detection, recovery, safe markup, schema failures, translation parity, source-version freshness, and draft acceptance.
- Browser suite: 11 tests covering all locale routes, 375 px layout, language switching, Arabic direction, both animation outcomes, keyboard playback/seeking, quiz feedback, reduced-motion behavior, and content without JavaScript.
- Static build: 17 pages, local assets, canonical/alternate links, sitemap, and a language gateway.
- Visual inspection: Russian and Arabic desktop pages, Hindi and Bengali mobile pages, and the Russian catalog.
- Contributor scaffold: generated and validated a disposable draft, then removed it.

GitHub Actions repeats content, build, and Chromium browser checks before the Pages deployment. The separate pull-request workflow also checks formatting and has read-only permissions. Initial translations remain `needs-review`; structural tests and this visual check do not replace independent fluent-speaker review.
