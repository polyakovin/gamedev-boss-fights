# Contributing to Boss Fight Atlas

You can improve one sentence, review a translation, report a misleading animation, or build a new mechanic. A focused PR is welcome; opening an issue first is optional for small corrections.

## A small edit in your browser

1. Open a lesson and follow **Improve this page**, or find its file under `content/mechanics/<id>/<locale>.json`.
2. Use GitHub’s edit button to create the change in your fork. For navigation, buttons, and shared labels, edit `locales/<locale>.json` instead.
3. Change the text while preserving JSON keys, array order, and `quiz.correctIndex`. Do not paste HTML into a text field.
4. Open a PR describing the wording problem and your correction. For translation work, name the language and whether independent fluent review has actually happened.

You do not need to run a local development environment for a wording-only PR. State that local checks were not run; the PR checks provide automated validation. A maintainer still reviews meaning and presentation.

## Work locally

Fork [the repository](https://github.com/polyakovin/gamedev-boss-fights), clone your fork, then use Node.js 24:

```sh
git clone https://github.com/YOUR-USERNAME/gamedev-boss-fights.git
cd gamedev-boss-fights
git switch -c feature/your-change
npm ci
npm run dev
```

Browse [the local atlas](http://localhost:4173/gamedev-boss-fights/). Run `npm run build` after source edits and refresh; `dev` does not watch files.

Before a PR, run:

```sh
npm run format:check
npm run check
npx playwright install chromium
npm run test:browser
```

Use `npm run format` to apply the pinned Prettier formatting, then inspect your diff. `format:check` checks formatting without rewriting files.

`check` runs schema/content validation, Node tests, and the static build. The Chromium install is a one-time setup. Browser tests are separate from `check`; report their result separately. If a command cannot run in your environment, include the exact blocker instead of marking it passed.

Commit only your source changes, push your branch to your fork, and open a PR against `polyakovin/gamedev-boss-fights`. Do not commit `dist/`, `node_modules/`, test reports, secrets, or editor-specific files.

## Choose the right scope

- **Translation correction:** edit the affected locale only. Follow the [translation guide](docs/translation-guide.md). You do not need to refresh unrelated languages when the source meaning is unchanged.
- **Meaning or mechanic change:** increment `meta.contentVersion`, update the source and published translations, set their `sourceVersion` to the version they now reflect, and reset each lesson’s `reviewStatus` to `needs-review`. Published lessons with a stale version are rejected. Explain the rule change in the PR.
- **New mechanic:** use `npm run new:mechanic -- your-mechanic` and follow the [content guide](docs/content-guide.md). A partial draft with `published: false` can merge before translations and animation are complete.
- **Layout or interaction:** include screenshots or a short recording when useful, describe keyboard and mobile behavior, and add relevant regression coverage.

## Review the experience

For changes that affect rendering or interaction, check the affected lesson at a narrow mobile width and on desktop. Navigate with the keyboard, inspect focus visibility, try the language switcher, play/pause and scrub the demo, and submit the quiz. Check Arabic right-to-left layout and reduced-motion mode when shared UI changes. Confirm that essential teaching content remains readable without JavaScript.

Keep labels and explanations available in text; color or animation alone must not carry a rule. A test pass does not establish translation fluency or prove that an animation teaches the right mechanic.

## CI and publishing

Pull requests, including those from forks, run checks without deployment credentials or repository secrets. Do not change the contribution workflow to execute untrusted PR code with privileged credentials. Publishing is a maintainer action through the default-branch GitHub Pages workflow; opening a PR does not deploy a contributor’s branch.

The public site uses `/gamedev-boss-fights/` as its URL prefix. Keep generated links, assets, and browser tests compatible with that subdirectory.

## Sources and licenses

Write original explanations and use original SVG illustrations. Do not add game screenshots, ripped sprites, or copied article passages. Cite useful references in the mechanic’s `meta.sources` and distinguish documented claims from illustrative examples. Broader design articles are context, not proof that every game follows the same rule.

By submitting work, you agree to contribute the text, translations, and original artwork under [CC BY 4.0](LICENSE-CONTENT.md), and source code under [MIT](LICENSE-CODE). Only submit material you are entitled to contribute. Existing third-party material retains its own license.
