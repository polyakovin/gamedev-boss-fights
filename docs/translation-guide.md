# Translating the atlas

A correction to one locale is enough for a useful PR. You can work through GitHub’s editor or use the local preview described in [CONTRIBUTING.md](../CONTRIBUTING.md).

## Find the right file

| Content                                                | Path                                   |
| ------------------------------------------------------ | -------------------------------------- |
| Shared navigation, headings, buttons, and feedback     | `locales/<locale>.json`                |
| Lesson text, simulation labels, descriptions, and quiz | `content/mechanics/<id>/<locale>.json` |
| Language names and writing direction                   | `locales/registry.json`                |
| Shared lesson metadata and source links                | `content/mechanics/<id>/meta.json`     |

English (`en`) is the source locale. Supported locales are `en`, `ru`, `zh-Hans`, `hi`, `bn`, `es`, `ar`, and `ja`. Arabic has `dir: "rtl"`; the others have `dir: "ltr"`. Adding a ninth locale requires coordinated changes to validation, the registry, interface strings, and published lessons; it is separate from improving an existing translation.

The Russian lesson title for Charge is **«Таран»**. Keep **Boss Fight Atlas** as the brand name in every language.

## Preserve the contract

Translate displayed strings naturally, including SVG descriptions, control labels, status messages, and quiz explanations. Keep UTF-8 text and ordinary JSON syntax: double quotes, no trailing commas, and no comments.

- Preserve keys, object structure, array lengths, and array order relative to the English source.
- Keep `quiz.correctIndex` unchanged. It is a zero-based index; translating or reordering only the answer text must not change which answer is correct.
- Keep `sourceVersion` as an integer identifying the `meta.contentVersion` reflected by the text. Every published locale, including English, must match that version; update the number only after updating the translation’s meaning.
- Keep machine values such as `reviewStatus` in their defined English form. Do not translate IDs, locale codes, filenames, or URL paths.
- In `examples`, preserve `dimension`, `game`, `boss`, `video`, and `videoDurationSeconds` exactly as in English. Translate only `body`.
- Do not add HTML, Markdown formatting, invisible direction overrides, or English filler to a text field.
- Use consistent terms for the mechanic, its phases, commitment, danger lane, and recovery. Prefer a natural explanation over an unclear borrowed term.

If the source contains an ambiguity, raise it in the PR instead of inventing a new rule in one language. A language-only correction should keep the underlying mechanic and quiz answer intact.

## Preserve the teaching

Keep the reader in the role of a game designer. Translate design questions, tuning checks, and implementation mistakes; do not turn them into instructions for beating the boss.

Game references should explain a design choice visible in the linked fight. Keep the focus on signals, commitment, danger geometry, the arena, or recovery instead of writing a walkthrough.

The initial Charge variant can follow the player while aiming, then fixes its direction. It cannot keep steering during the charge. The designer checks that ordinary sideways movement can move the whole collision shape out of the lane; neither a special dodge ability nor invulnerability is required.

Use only “boss” and “player.” Keep the example free of setting-specific roles and objects. If the boss blocks an attack, make the condition clear and leave another player response useful.

## Preview and validate

Run `npm run check` for structural validation and a fresh build. Use `npm run dev` to view the page; after subsequent edits, rebuild and refresh. Check the language’s catalog, lesson, animation controls, and quiz at desktop and mobile widths. Long translations should wrap naturally without hiding controls or clipping letters.

For Arabic, inspect the right-to-left page order, punctuation around numbers and the English brand, focus movement, and control labels. The Charge diagram deliberately keeps its spatial coordinates unchanged; surrounding text and controls follow the page direction. For Hindi and Bengali, check vowel signs and line height. For Chinese and Japanese, check line breaks and compact labels.

Try keyboard operation and reduced-motion mode when labels or shared UI change. Automated checks catch structural problems; they cannot certify fluency. If using GitHub’s editor only, state that you did not run local checks and let PR CI report its result.

## Review status

`reviewStatus: "needs-review"` means an independent fluent review is still needed. Machine-generated or assisted text starts in this state. Initial translations in this repository also start here.

Set a lesson to `reviewed` only after a person other than its author who is fluent in the target language has checked the complete lesson against the current English meaning and the rendered page. Record the reviewer, reviewed locale, current `meta.contentVersion`, and review scope in the PR. The reviewer should explicitly state their language proficiency; do not infer it from their name, location, or automated tools. A native-speaker review claim additionally requires the reviewer to identify themselves as a native speaker.

Review includes the animation text alternatives and controls, the quiz’s correct answer, and terminology consistency. A maintainer can then confirm the status change. The interface files do not have a separate review-status field; document their review scope in the PR instead.

If you edit a previously reviewed translation, return it to `needs-review` unless the new wording has also received independent review. When source meaning changes, the content editor increments `meta.contentVersion`, updates published translations and their `sourceVersion`, and resets every locale to `needs-review`. A mismatched `sourceVersion` blocks publication; a matching number records source alignment, not language review. Typo-only source edits do not require a semantic version bump.

## A helpful translation PR

Name the locale and page, briefly explain the old wording and the improved meaning, and report the checks you ran. If review is requested, say so explicitly. A PR can improve one phrase while keeping `needs-review`; there is no requirement to certify a whole language before contributing.

Translations are contributed under [CC BY 4.0](../LICENSE-CONTENT.md), like the source lessons.
