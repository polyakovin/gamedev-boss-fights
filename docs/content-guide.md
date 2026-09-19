# Writing and adding a mechanic

A lesson should teach a designer how to build, tune, and test one mechanic. Keep its scope specific enough for the animation, prose, and quiz to agree.

## Start with a draft

From the repository root:

```sh
npm run new:mechanic -- your-mechanic
```

Use a lowercase slug with hyphens. The command creates `content/mechanics/your-mechanic/meta.json` and an English lesson with `TODO:` text. Keep `published: false` while the mechanic is incomplete. Drafts are validated but are not rendered, listed in the catalog, or included as published lessons in the sitemap.

A draft PR can contain just the proposed explanation and open questions. It does not need all eight translations or a finished animation. Fill the required JSON fields and keep any unfinished text clearly marked. Do not set `published: true` merely to make an incomplete lesson appear on the site.

## Write the lesson

Use `content/mechanics/charge/en.json` as a structural example and `schemas/lesson.schema.json` as the contract. JSON text is plain text, not Markdown or HTML.

| Field                         | What it should teach                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| `title`, `variant`, `summary` | Name the mechanic and define the exact behavior covered                     |
| `learning`                    | State the design skill the reader should leave with                         |
| `demo`                        | Turn the animation into a test bench for phases, geometry, and outcomes     |
| `steps`                       | Ask exactly three design questions in a useful order                        |
| `mistakes`                    | Explain common implementation mistakes and their effect on the encounter    |
| `designNotes`                 | Give concrete checks for timing, geometry, readability, and upgrades        |
| `story`                       | Explain which simple arena layout makes the attack readable                 |
| `adaptation`                  | Explain how the encounter respects available movement, reach, and upgrades  |
| `distinction`                 | Separate neighboring mechanics without asserting universal terminology      |
| `examples`                    | Compare concrete 2D and 3D bosses and link to a video of each fight         |
| `quiz`                        | Test a design judgment with three options and one zero-based `correctIndex` |
| `reviewStatus`                | Record `needs-review` until independent fluent review is complete           |

The current template requires exactly three steps, matching the localized “Three questions” heading. Its demo contract has four phase names and four descriptions. Do not force a mechanic into misleading phases to fit it. If another mechanic needs a different structure, update the schema, renderer, translations, and tests together. Shared headings and feedback live in `locales/*.json`; check that they still fit when extending the lesson structure.

Address the game designer, not a player looking for a walkthrough. Prefer concrete design variables and checks: what becomes fixed, what can still change, which signal communicates the change, and how much space the player must be able to clear. Distinguish an attack’s visual telegraph from a teaching overlay. Test optional dashes, jumps, and invulnerability states without making them silently mandatory for a basic escape.

### Add game references

Every published lesson must include at least one 2D and one 3D boss that uses the mechanic. Name the game and boss, explain one useful design observation, and link directly to a YouTube video of that boss fight. Verify that the link works before submitting the PR.

Use the examples to compare signals, commitment, danger geometry, arena constraints, and recovery. Describe how the implementation changes the design problem; do not give the reader instructions for defeating the boss. A reference is evidence that a design pattern has different forms, not a recipe to copy. Keep proper game and boss names and video URLs identical across translations while localizing the observation.

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
3. A small browser module handles playback, seeking, scenarios, and status updates.
4. Tests check the rule itself as well as the visible controls.

Keep prose and control labels in the locale JSON. Escape text inserted into markup, and safely encode JSON embedded in HTML. Pause on initial load and when the page becomes hidden. Provide phase selection and a timeline so readers can learn without continuous motion. Do not rely on color alone to distinguish danger and safety.

Use logical CSS properties for surrounding UI and test Arabic `dir="rtl"`. A spatial diagram may keep a stable coordinate direction, as Charge does, while labels and controls follow the page language. Preserve accessible names, keyboard operation, visible focus, and understandable static output with JavaScript disabled.

Provide catalog artwork through the adapter’s `thumbnail` function. It should depict this mechanic accurately; reusing the charge diagram for a different attack could teach the wrong shape.

## Metadata and references

`meta.json` contains a unique `id` matching its folder, a unique positive `number`, `published`, `sourceLocale: "en"`, a positive `contentVersion`, `animation`, `related`, and `sources`. Related IDs must refer to other existing mechanics. Each source has a descriptive `title` and an HTTPS `url`.

Explain the role of a source in the PR: a documented example, research supporting a claim, or wider design context. Prefer a developer’s own description or another primary source for claims about a specific game. Verify the link and the relevant claim. The current original teaching example is not a reconstruction of a particular game; its linked design articles provide context rather than evidence for a universal rule.

Create original illustrations. Do not copy game screenshots, sprites, logos, or article artwork into the atlas. Keep third-party links as references and respect their original licenses. Our [content license](../LICENSE-CONTENT.md) applies to our contributions, not to linked material.

YouTube links remain external references. Do not download or publish video frames, thumbnails, subtitles, or other assets from them. Linking to a video does not imply that its creator endorses the atlas.

## Publish or change a published lesson

Before changing `published` to `true`, ensure every registered locale has a complete lesson whose integer `sourceVersion` equals `meta.contentVersion`, `meta.animation` names a registered adapter, and no `TODO:` placeholders remain. Check schemas in `schemas/`; run `npm run check` and the browser suite, then inspect the lesson in all eight languages. Initial translations may still be `needs-review`; this must remain visible and must not be described as native review.

When an edit changes meaning, increment `meta.contentVersion`, synchronize the published lesson’s translations, and set each updated lesson’s `sourceVersion` to that version, including English. Reset `reviewStatus` to `needs-review` in every locale. A stale `sourceVersion` blocks publication. Update the number only after bringing the text into agreement with the new meaning; changing the number alone is not synchronization. Describe what changed in the PR so translators can verify the affected passage. A spelling correction that preserves meaning does not require a version bump or unrelated translation edits.

Never use `reviewed` to mean merely that JSON validation passed. Follow the [translation review process](translation-guide.md#review-status), and include actual validation results and remaining limitations in the PR.
