# Boss Fight Atlas — working instructions

## Bootstrap and checks

- Resolve this repository’s Git root and inspect `git status` before editing. Preserve unrelated work and stage explicit task-owned paths only.
- Read `README.md`, `package.json`, `.node-version`, and the relevant content and schemas. Runtime: Node.js 24; static generator with plain browser modules and SVG.
- Setup: `npm ci`. Preview: `npm run dev` at `http://localhost:4173/gamedev-boss-fights/`. Rebuild after edits with `npm run build`; no watcher is configured.
- Canonical gate: `npm run check`. Browser gate: `npx playwright install chromium`, then `npm run test:browser`. Report checks actually run and remaining blockers.
- Formatting: `npm run format` applies the pinned Prettier version; `npm run format:check` checks without rewriting. Inspect the diff after formatting.

## Boundaries

- Lessons: `content/mechanics/<id>/<locale>.json`; shared interface text: `locales/*.json`; metadata: each mechanic’s `meta.json`. Preserve schema contracts and quiz answer order; the current template requires exactly three steps.
- `lib/animations.mjs` registers each adapter’s `render`, `thumbnail`, `styles`, and `scripts`. Keep simulation rules pure in `src/*-model.mjs`; browser controllers own DOM and playback.
- Keep localized text out of code, escape HTML and embedded JSON, preserve keyboard controls, text alternatives, static readability, Arabic RTL, and reduced-motion behavior.
- Generated `dist/`, dependencies, browser reports, credentials, and `.env` stay out of Git. PR CI must remain safe for forks and must not expose deployment privileges to untrusted PR code.

## Content and publishing

- Read `docs/content-guide.md` and `docs/translation-guide.md` when editing lessons. `npm run new:mechanic -- slug` creates an unpublished draft; partial drafts can merge.
- Publishing requires complete lessons in `en`, `ru`, `zh-Hans`, `hi`, `bn`, `es`, `ar`, and `ja`, each with `sourceVersion === meta.contentVersion`, a registered animation, and no unresolved placeholders.
- Published lessons require concrete examples from both 2D and 3D games, each with a verified YouTube boss-fight video and a design observation. Preserve game names, boss names, dimensions, and URLs across translations.
- Meaning changes increment `meta.contentVersion`, synchronize published translations and their `sourceVersion` values, and reset all lesson `reviewStatus` values to `needs-review`. Never claim native or fluent review without an actual independent reviewer.
- Address game designers. Lessons explain how to build, tune, and test mechanics; they must not read like instructions for beating a boss.
- Keep examples setting-neutral: use only “boss” and “player.” Preserve Charge’s fixed direction after aiming, sideways escape, full-body lane clearance, and useful recovery. If the boss blocks an attack, show it clearly and leave another response useful.
- Text, translations, and original SVG artwork use CC BY 4.0; implementation code uses MIT. Do not import game screenshots or ripped assets. Cite sources accurately and distinguish illustrative examples from universal claims.
- Keep operational instructions concise; put editorial rationale and review guidance in `docs/`.
