# Writing and adding a mechanic

A lesson should teach a designer how to build, tune, and test one mechanic. Keep its scope specific enough for the animation and prose to agree.

## Start with a draft

From the repository root:

```sh
npm run new:mechanic -- your-mechanic
```

Use a lowercase slug with hyphens. The command creates `content/mechanics/your-mechanic/meta.json` and an English lesson with `TODO:` text. Keep `published: false` while the mechanic is incomplete. Drafts are validated but are not rendered, listed in the catalog, or included as published lessons in the sitemap.

A draft PR can contain just the proposed explanation and open questions. It does not need all eight translations or a finished animation. Fill the required JSON fields and keep any unfinished text clearly marked. Do not set `published: true` merely to make an incomplete lesson appear on the site.

## Write the lesson

Use `content/mechanics/charge/en.json` as a structural example and `schemas/lesson.schema.json` as the contract. JSON text is plain text, not Markdown or HTML.

| Field                         | What it should teach                                                       |
| ----------------------------- | -------------------------------------------------------------------------- |
| `title`, `variant`, `summary` | Name the mechanic and provide compact catalog metadata                     |
| `overview`                    | Define the rule and explain why its signal, response, and reward work      |
| `learning`                    | State the tuning task that introduces the implementation checklist         |
| `demo`                        | Turn the animation into a test bench for phases, geometry, and outcomes    |
| `steps`                       | Ask exactly three design questions in a useful order                       |
| `mistakes`                    | Explain common implementation mistakes and their effect on the encounter   |
| `designNotes`                 | Give concrete checks for timing, geometry, readability, and upgrades       |
| `story`                       | Explain which simple arena layout makes the attack readable                |
| `adaptation`                  | Explain how the encounter respects available movement, reach, and upgrades |
| `distinction`                 | Separate neighboring mechanics without asserting universal terminology     |
| `lensNotes`                   | Explain how each lens from `meta.lenses` applies to this mechanic          |
| `examples`                    | Compare 2D and 3D bosses with a sourced screenshot and focused video       |
| `reviewStatus`                | Record `needs-review` until independent fluent review is complete          |

The current template requires exactly three steps, matching the localized “Three questions” heading. Its demo contract has three active phase names and three descriptions. Do not add an idle phase merely to fill time. If another mechanic needs a different structure, update the schema, renderer, translations, and tests together. Shared headings live in `locales/*.json`; check that they still fit when extending the lesson structure.

Address the game designer, not a player looking for a walkthrough. Prefer concrete design variables and checks: what becomes fixed, what can still change, which signal communicates the change, and how much space the player must be able to clear. Distinguish an attack’s visual telegraph from a teaching overlay. Test optional dashes, jumps, and invulnerability states without making them silently mandatory for a basic escape.

The mechanic page places `overview` directly under the title as one compact paragraph. Use its first sentence to define the behavior and the rest to explain why the signal, available response, and resulting opportunity work together. Do not repeat the subtitle, variant label, catalog summary, or checklist introduction there.

Content review is as valuable as translation review. Check factual claims, design concepts, terminology, examples, source relevance, and whether the animation actually demonstrates the written rule. When correcting a claim, link evidence and state whether it documents a particular game, supports a general principle, or is only an illustrative design choice.

### Add design lenses

Design lenses are independent materials under `content/lenses/<id>/`. Each lens has `meta.json` plus one translation file per locale, its own URL, and a catalog entry. Start a draft with:

```sh
npm run new:lens -- your-lens
```

Keep `published: false` while the lens is incomplete. The localized file contains a short `title` and `summary`; explain what the lens reveals and what a designer should inspect. A lens must apply to games in general: describe choices, systems, feedback, challenges, space, learning, or another reusable concern without assuming a boss fight. Treat lenses as practical analytical tools, not a universal taxonomy.

A mechanic connects to published lenses through the stable kebab-case IDs in `meta.lenses`. Each lesson translation has a matching `lensNotes` array in the same order; its short, mechanic-specific explanation becomes the tooltip. This is the only place where the lens explanation should assume a boss or a particular mechanic. The chip label and destination come from the independent lens material, whose `summary` defines the reusable lens across games. When changing a published lens’s meaning, increment its own `contentVersion`, update all published translations and their `sourceVersion`, and reset their `reviewStatus`.

### Add game references

Every published lesson must include at least one 2D and one 3D boss that uses the mechanic. Name the game and boss, explain one useful design observation, show a clear in-game screenshot of that boss, and link directly to a YouTube demonstration of the behavior. Verify the screenshot, its source page, and the video before submitting the PR.

Keep the screenshot externally hosted: record its direct HTTPS URL in `screenshot` and the page that published it in `screenshotSource`. The frame should make the named boss easy to recognize at card size; avoid key art, logos, unrelated enemies, strategy diagrams, and thumbnails dominated by added text. The source link is displayed over the image. Preserve both fields across translations. Externally hosted screenshots retain their owners’ rights and are not covered by the atlas’s CC BY license; do not copy them into the repository.

Prefer a focused clip no longer than three minutes. It should show the boss behavior without travel, builds, commentary, or unrelated play; a speedrun is not a useful substitute merely because it is short. Record the full clip length in `videoDurationSeconds`. When the only useful source is longer, add `&t=<seconds>s` so the link opens immediately before the mechanic becomes visible. A chapter or the start of the whole fight is too broad. CI rejects long references without this exact timestamp.

Use the examples to compare signals, commitment, danger geometry, arena constraints, and recovery. Describe how the implementation changes the design problem; do not give the reader instructions for defeating the boss. A reference is evidence that a design pattern has different forms, not a recipe to copy. Keep proper game and boss names, video URLs, and `videoDurationSeconds` identical across translations while localizing the observation.

For the initial Charge lesson, preserve these facts:

- The boss can aim before commitment; direction is frozen after commitment and throughout the charge.
- The intended escape moves the player’s entire collision shape out of the danger lane. Distance gained along that same lane is insufficient in this example.
- Ordinary sideways movement must provide a reachable escape. Recovery must include time to approach and complete a counterattack.
- Use only “boss” and “player.” Keep the example independent of any game, character, or setting.
- If the boss blocks an attack, show it clearly. Keep another response useful and never silently cancel player upgrades.

## Connect an animation

An animation is code, not a video file. Register its identifier in `lib/animations.mjs` and reference that identifier from `meta.animation`. Each entry provides a `render` function for the lesson diagram, a `thumbnail` function for its catalog artwork, and its browser `styles` and `scripts`.

Use `lib/charge-view.mjs`, `src/charge-model.mjs`, `src/charge-player.mjs`, and `src/charge.css` as examples of the boundaries:

1. A pure model computes the current phase, positions, and outcome without the DOM or wall-clock state.
2. The view emits an original SVG, text alternatives, labeled native controls, and escaped localized data.
3. A small browser module handles playback, seeking, and status updates.
4. Tests check the rule itself as well as the visible controls.

Keep prose and control labels in the locale JSON. Escape text inserted into markup, and safely encode JSON embedded in HTML. Charge autoplays as a continuous two-direction loop, pauses while its page is hidden, and exposes only a timeline slider. Its phase labels are explanations with hover and keyboard-focus tooltips, not playback controls. Respect the system reduced-motion preference by disabling autoplay while keeping the slider available. Do not rely on color alone to distinguish danger and safety.

Use logical CSS properties for surrounding UI and test Arabic `dir="rtl"`. A spatial diagram may keep a stable coordinate direction, as Charge does, while labels and controls follow the page language. Preserve accessible names, keyboard operation, visible focus, and understandable static output with JavaScript disabled.

Provide catalog artwork through the adapter’s `thumbnail` function. Reuse the same character and object SVG assets as the full lesson animation so the preview remains recognizable when the main art changes. The preview may simplify the surrounding arena and overlays, but it should depict this mechanic accurately; reusing the charge diagram for a different attack could teach the wrong shape.

## Maintain the visual system

Use the semantic color tokens in `src/site.css` instead of adding component-specific hex values. The neutral graphite-blue foundation keeps dense teaching material readable; teal marks links, controls, and analytical state; indigo identifies design lenses; the warm signal color is reserved for danger and alerts. Keep text and controls at WCAG AA contrast in both light and dark themes, and do not rely on hue alone to explain a mechanic.

Typography has three roles: Inter for continuous reading, Manrope for headings and the atlas identity, and IBM Plex Mono for compact labels, categories, and technical metadata. Chinese, Japanese, Arabic, Devanagari, and Bengali pages load the matching Noto Sans family as a script-specific fallback. Preserve these roles when adding a component and inspect at least one Latin or Cyrillic page plus every affected script locale before publishing.

## Metadata and references

Mechanic `meta.json` contains a unique `id` matching its folder, a unique positive `number`, `published`, `sourceLocale: "en"`, a positive `contentVersion`, `animation`, `lenses`, `related`, and `sources`. Lens IDs must refer to published entries under `content/lenses/`; related mechanic IDs must refer to other existing mechanics. Lens metadata follows the same publication/version pattern without an animation. Each source has a descriptive `title` and an HTTPS `url`.

Explain the role of a source in the PR: a documented example, research supporting a claim, or wider design context. Prefer a developer’s own description or another primary source for claims about a specific game. Verify the link and the relevant claim. When useful, combine complementary formats such as a design talk, attack analysis, animation reference, accessibility guideline, and engine documentation instead of listing several sources that repeat the same advice. The current original teaching example is not a reconstruction of a particular game; its linked materials provide context rather than evidence for a universal rule.

Create original teaching illustrations. Do not copy game screenshots, sprites, logos, thumbnails, or article artwork into the repository. A boss-reference card may embed an externally hosted in-game screenshot with a visible source link as described above. Keep third-party material separate and respect its original rights. Our [content license](../LICENSE-CONTENT.md) applies to our contributions, not to embedded or linked material.

YouTube links remain external references. Do not download, rehost, or commit video frames, thumbnails, subtitles, or other assets from them. A reference card may load a YouTube-hosted thumbnail directly when its source link identifies the video. Linking to or embedding material does not imply that its creator endorses the atlas.

## Publish or change a published lesson

Before changing `published` to `true`, ensure every registered locale has a complete lesson whose integer `sourceVersion` equals `meta.contentVersion`, `meta.animation` names a registered adapter, and no `TODO:` placeholders remain. Check schemas in `schemas/`; run `npm run check` and the browser suite, then inspect the lesson in all eight languages. Initial translations may still be `needs-review`; this must remain visible and must not be described as native review.

When an edit changes meaning, increment `meta.contentVersion`, synchronize the published lesson’s translations, and set each updated lesson’s `sourceVersion` to that version, including English. Reset `reviewStatus` to `needs-review` in every locale. A stale `sourceVersion` blocks publication. Update the number only after bringing the text into agreement with the new meaning; changing the number alone is not synchronization. Describe what changed in the PR so translators can verify the affected passage. A spelling correction that preserves meaning does not require a version bump or unrelated translation edits.

Never use `reviewed` to mean merely that JSON validation passed. Follow the [translation review process](translation-guide.md#review-status), and include actual validation results and remaining limitations in the PR.
