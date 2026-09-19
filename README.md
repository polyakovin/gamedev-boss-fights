# Boss Fight Atlas

An open, interactive encyclopedia of boss mechanics for game designers. Each lesson explains how to shape, communicate, tune, and test one part of a boss encounter.

[Explore the atlas](https://polyakovin.github.io/gamedev-boss-fights/) · [Read in Russian](README.ru.md) · [Contribute](CONTRIBUTING.md)

The first lesson is **Charge**. Compare two test paths, pause the animation, and inspect how tracking, commitment, collision, and recovery work together. Six design lenses connect the mechanic to reusable concepts, while six boss references from 2D and 3D games show how it changes across real encounters.

Available in English, Russian, Simplified Chinese, Hindi, Bengali, Spanish, Arabic, and Japanese. Facts, design concepts, examples, and translations all welcome independent review. [Open «Таран» in Russian](https://polyakovin.github.io/gamedev-boss-fights/ru/mechanics/charge/).

## Make your first contribution

A single wording correction, factual check, concept review, or translation improvement is a useful PR. Open a lesson’s **Improve this page** link, edit its JSON on GitHub, and propose the change from your fork. Keep the keys and array order intact. You do not need to add a whole mechanic or translate all eight languages to contribute.

- [Contribution guide](CONTRIBUTING.md): small PRs, checks, and review.
- [Content guide](docs/content-guide.md): new mechanics, examples, animations, and sources.
- [Translation guide](docs/translation-guide.md): language files, terminology, and review status.
- [Report a content problem or suggest a mechanic](https://github.com/polyakovin/gamedev-boss-fights/issues/new?template=content.yml).
- [Report or review a translation](https://github.com/polyakovin/gamedev-boss-fights/issues/new?template=translation.yml).

## Run locally

Use **Node.js 24**, as recorded in `.node-version`, and npm.

```sh
npm ci
npm run dev
```

Open [localhost:4173/gamedev-boss-fights/](http://localhost:4173/gamedev-boss-fights/). The Russian lesson is at `/gamedev-boss-fights/ru/mechanics/charge/`.

The development command builds once and serves `dist/`. After editing source files, run `npm run build` in another terminal and refresh the page. There is no automatic rebuild watcher.

```sh
npm run format:check
npm run check
npx playwright install chromium
npm run test:browser
```

`check` validates content, runs Node tests, and builds the static site. Browser tests cover the rendered experience; install Chromium once before running them. See [CONTRIBUTING.md](CONTRIBUTING.md) for what to inspect manually.

Use `npm run format` to apply the pinned Prettier formatting, or `npm run format:check` to check it without rewriting files.

## How it is built

This is a static Node generator with plain HTML, CSS, browser JavaScript modules, and original SVG illustrations. It has no frontend framework or application server in production. GitHub Pages serves the generated files.

| Location                               | Purpose                                                            |
| -------------------------------------- | ------------------------------------------------------------------ |
| `content/mechanics/<id>/meta.json`     | Publication state, content version, animation ID, and sources      |
| `content/mechanics/<id>/<locale>.json` | A complete lesson in one language                                  |
| `locales/*.json`                       | Shared interface translations and language registry                |
| `schemas/`                             | JSON schemas checked before building                               |
| `lib/animations.mjs`, `lib/*-view.mjs` | Registered lesson diagrams, catalog thumbnails, and browser assets |
| `src/`                                 | Browser behavior, styles, original SVG, and pure simulation models |
| `scripts/`                             | Validation, generation, draft scaffolding, and local server        |
| `tests/`                               | Model and browser checks                                           |
| `dist/`                                | Generated output; not committed                                    |

Start a new draft with `npm run new:mechanic -- your-mechanic`. Drafts can be merged incrementally and are excluded from the published site. Publishing requires complete content in all eight languages with each lesson’s `sourceVersion` matching `meta.contentVersion`, a registered animation, and no unresolved `TODO:` placeholders. Read the [content guide](docs/content-guide.md) before publishing.

The default URL prefix is `/gamedev-boss-fights/`. `lib/config.mjs` defines the repository, site origin, and base path. Forks that publish their own site should update those values for their destination; normal contribution forks do not need deployment credentials.

## License

Text, translations, and original SVG illustrations are licensed under **[CC BY 4.0](LICENSE-CONTENT.md)**. Source code is licensed under **[MIT](LICENSE-CODE)**. Linked articles and other third-party works retain their own licenses. Please keep attribution when reusing or adapting the lessons.
