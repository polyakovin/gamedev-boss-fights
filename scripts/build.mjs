import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT, loadContent, validateContent } from '../lib/content.mjs';
import { animations } from '../lib/animations.mjs';
import { escape as e } from '../lib/html.mjs';
import { link, canonical, REPOSITORY } from '../lib/config.mjs';
const { locales, ui, mechanics } = await validateContent(await loadContent());
const published = mechanics.filter((m) => m.meta.published);
for (const m of published)
  if (!animations[m.meta.animation]) throw new Error(`Unknown animation: ${m.meta.animation}`);
const out = path.join(ROOT, 'dist');
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(path.join(out, 'assets'), { recursive: true });
await fs.cp(path.join(ROOT, 'src'), path.join(out, 'assets'), { recursive: true });
await fs.writeFile(path.join(out, '.nojekyll'), '');
const assetVersions = new Map();
for (const entry of await fs.readdir(path.join(ROOT, 'src'), { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const source = await fs.readFile(path.join(ROOT, 'src', entry.name));
  assetVersions.set(entry.name, createHash('sha256').update(source).digest('hex').slice(0, 10));
}
function asset(name) {
  const version = assetVersions.get(name);
  if (!version) throw new Error(`Unknown asset: ${name}`);
  return `${link(`assets/${name}`)}?v=${version}`;
}
const urls = [];
async function write(route, html) {
  const dest = path.join(out, route, 'index.html');
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, html);
  urls.push(canonical(route));
}
function languages(active, id) {
  const current = locales.find((locale) => locale.code === active);
  return /* HTML */ `<details class="language-menu">
    <summary>
      <span class="language-flag" aria-hidden="true">${e(current.flag)}</span>
      <span>${e(current.name)}</span>
    </summary>
    <nav aria-label="${e(ui[active].language)}">
      ${locales.map((l) => `<a href="${link(l.code + '/' + (id ? `mechanics/${id}/` : ''))}" lang="${l.code}" hreflang="${l.code}" dir="${l.dir}"${l.code === active ? ' aria-current="page"' : ''}><span class="language-flag" aria-hidden="true">${e(l.flag)}</span><span>${e(l.name)}</span>${l.code === active ? '<span class="language-check" aria-hidden="true">✓</span>' : ''}</a>`).join('')}
    </nav>
  </details>`;
}
function themeButton(darkLabel, lightLabel) {
  return /* HTML */ `<button
    class="theme-toggle"
    type="button"
    data-theme-toggle
    data-label-dark="${e(darkLabel)}"
    data-label-light="${e(lightLabel)}"
    aria-label="${e(darkLabel)}"
    title="${e(darkLabel)}"
  >
    <span aria-hidden="true"></span>
  </button>`;
}
const themeHead = /* HTML */ `<meta name="color-scheme" content="light dark" />
  <script>
    (() => {
      try {
        const saved = localStorage.getItem('boss-fight-atlas-theme');
        const theme =
          saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.dataset.theme = theme;
      } catch {}
    })();
  </script>`;
function shell(locale, title, description, body, { id, assets = [], catalog = false } = {}) {
  const t = ui[locale.code];
  const route = locale.code + '/' + (id ? `mechanics/${id}/` : '');
  return /* HTML */ `<!doctype html>
    <html lang="${locale.code}" dir="${locale.dir}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        ${themeHead}
        <title>${e(title)} · Boss Fight Atlas</title>
        <meta name="description" content="${e(description)}" />
        <link rel="canonical" href="${canonical(route)}" />
        ${locales.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${canonical(l.code + '/' + (id ? `mechanics/${id}/` : ''))}">`).join('')}
        <link
          rel="alternate"
          hreflang="x-default"
          href="${canonical('en/' + (id ? `mechanics/${id}/` : ''))}"
        />
        <meta property="og:title" content="${e(title)} · Boss Fight Atlas" />
        <meta property="og:description" content="${e(description)}" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="${canonical(route)}" />
        <link rel="icon" href="${asset('favicon.svg')}" type="image/svg+xml" />
        <link rel="stylesheet" href="${asset('site.css')}" />
        ${assets
          .filter((a) => a.endsWith('.css'))
          .map((a) => `<link rel="stylesheet" href="${asset(a)}">`)
          .join('')}
        <script type="module" src="${asset('site.mjs')}"></script>
        ${assets
          .filter((a) => a.endsWith('.mjs'))
          .map((a) => `<script type="module" src="${asset(a)}"></script>`)
          .join('')}
      </head>
      <body${catalog ? ' class="catalog-page"' : ''}>
        <a class="skip-link" href="#main">${e(t.skip)}</a>
        <header class="site-header">
          <div class="header-inner">
            <a class="brand" href="${link(locale.code + '/')}" aria-label="Boss Fight Atlas"
              ><span class="brand-mark" aria-hidden="true">✳</span
              ><span>Boss Fight <b>Atlas</b></span></a
            >
            <nav class="header-nav" aria-label="${e(t.catalog)}">
              <a
                class="catalog-link"
                href="${link(locale.code + '/')}"
                ${catalog ? ' aria-current="page"' : ''}
                >${e(t.catalog)}</a
              ><a class="contribute-link" href="${REPOSITORY}/blob/main/CONTRIBUTING.md"
                >${e(t.contribute)} <span aria-hidden="true">↗</span></a
              >
            </nav>
            ${themeButton(t.themeDark, t.themeLight)}
            ${languages(locale.code, id)}
          </div>
        </header>
        ${body}
        <footer class="site-footer">
          <a class="brand footer-brand" href="${link(locale.code + '/')}">Boss Fight Atlas</a>
          <div>
            <p>${e(t.tagline)}</p>
            <p class="legal">
              <a href="${REPOSITORY}/blob/main/LICENSE-CONTENT.md">${e(t.license)}</a>
            </p>
          </div>
          <a href="${REPOSITORY}">GitHub <span aria-hidden="true">↗</span></a>
        </footer>
      </body>
    </html>`;
}
function tiles(items, cls = '') {
  return items
    .map(
      (item, i) =>
        `<article class="note ${cls}">${cls === 'step' ? `<span class="step-number" aria-hidden="true">0${i + 1}</span>` : ''}<h3>${e(item.title)}</h3><p>${e(item.body)}</p></article>`,
    )
    .join('');
}
function exampleGroup(dimension, label, items, t) {
  const cards = items
    .filter((item) => item.dimension === dimension)
    .map(
      (item) =>
        /* HTML */ `<article class="game-example">
          <span class="game-example__game">${e(item.game)}</span>
          <h4>${e(item.boss)}</h4>
          <p>${e(item.body)}</p>
          <a
            href="${e(item.video)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="${e(`${t.watchVideo}: ${item.boss}, ${item.game}`)}"
            ><span aria-hidden="true">▶</span>${e(t.watchVideo)}<span aria-hidden="true">↗</span></a
          >
        </article>`,
    )
    .join('');
  return /* HTML */ `<section class="example-group" aria-labelledby="examples-${dimension}">
    <h3 id="examples-${dimension}">${e(label)}</h3>
    <div class="example-grid">${cards}</div>
  </section>`;
}
for (const locale of locales) {
  const t = ui[locale.code];
  const featured = published[0];
  const featuredContent = featured?.translations[locale.code];
  const lessonPath = featured ? `${locale.code}/mechanics/${featured.meta.id}/` : `${locale.code}/`;
  const atlasLinks = [
    {
      title: t.catalog,
      text: t.mechanicsNavText,
      href: '#mechanics',
      count: published.length,
    },
    {
      title: t.simulationNavTitle,
      text: t.simulationNavText,
      href: link(`${lessonPath}#simulation`),
      count: featured ? 1 : 0,
    },
    {
      title: t.concepts,
      text: t.conceptsNavText,
      href: link(`${lessonPath}#concepts`),
      count: featuredContent?.concepts.length ?? 0,
    },
    {
      title: t.examples,
      text: t.examplesNavText,
      href: link(`${lessonPath}#examples`),
      count: featuredContent?.examples.length ?? 0,
    },
    {
      title: t.sources,
      text: t.sourcesNavText,
      href: link(`${lessonPath}#sources`),
      count: featured?.meta.sources.length ?? 0,
    },
    {
      title: t.contribute,
      text: t.contributeNavText,
      href: `${REPOSITORY}/blob/main/CONTRIBUTING.md`,
      external: true,
      count: '+',
    },
  ];
  const cards = published
    .map((m) => {
      const c = m.translations[locale.code];
      return /* HTML */ `<a
        class="mechanic-card"
        href="${link(`${locale.code}/mechanics/${m.meta.id}/`)}"
        ><div class="card-diagram" aria-hidden="true">
          ${animations[m.meta.animation].thumbnail(m.meta.id)}<span class="card-number"
            >${String(m.meta.number).padStart(2, '0')}</span
          >
        </div>
        <div class="card-copy">
          <span class="eyebrow">${e(c.category)}</span>
          <h3>${e(c.title)} <span aria-hidden="true">↗</span></h3>
          <p>${e(c.summary)}</p>
          <p class="card-learning"><strong>${e(t.learnLabel)}.</strong> ${e(c.learning)}</p>
          <span class="text-link">${e(t.readLesson)} <span aria-hidden="true">→</span></span>
        </div></a
      >`;
    })
    .join('');
  const body = /* HTML */ `<main id="main" class="catalog-main">
    <section class="catalog-hero">
      <div class="catalog-topline">
        <span class="eyebrow">${e(t.indexEyebrow)}</span>
        <div class="catalog-meta">
          <span class="small-dot" aria-hidden="true"></span>${e(t.allLanguages)}
        </div>
      </div>
      <h1>${e(t.indexTitle)}</h1>
      <p class="lead">${e(t.indexSubtitle)}</p>
    </section>
    <div class="catalog-overview">
      <section id="mechanics" aria-labelledby="mechanics-title">
        <div class="section-heading">
          <h2 id="mechanics-title">${e(t.available)}</h2>
          <span class="count">${published.length}</span>
        </div>
        <div class="catalog-grid">${cards}</div>
      </section>
      <nav class="atlas-map" aria-labelledby="atlas-map-title">
        <div class="section-heading atlas-map__heading">
          <h2 id="atlas-map-title">${e(t.siteMapTitle)}</h2>
        </div>
        ${featuredContent ? `<p class="atlas-map__intro">${e(t.siteMapIntro)}: <a href="${link(lessonPath)}">${e(featuredContent.title)}</a></p>` : ''}
        <div class="atlas-map__grid">
          ${atlasLinks
            .map(
              (item) =>
                /* HTML */ `<a class="atlas-map__link" href="${e(item.href)}">
                  <span>
                    <strong
                      >${e(item.title)} <span class="atlas-map__count">${item.count}</span></strong
                    >
                    <small>${e(item.text)}</small>
                  </span>
                  <span class="atlas-map__arrow" aria-hidden="true"
                    >${item.external ? '↗' : '→'}</span
                  >
                </a>`,
            )
            .join('')}
        </div>
      </nav>
    </div>
  </main>`;
  await write(
    locale.code + '/',
    shell(locale, t.catalog, t.indexSubtitle, body, { catalog: true }),
  );
  for (const m of published) {
    const c = m.translations[locale.code],
      a = animations[m.meta.animation];
    const body = /* HTML */ `<div class="lesson-layout">
      <main id="main" class="lesson-main">
        <div class="lesson-toolbar">
          <a class="back-link" href="${link(locale.code + '/')}">← ${e(t.catalog)}</a>
          <a
            class="lesson-edit"
            href="${REPOSITORY}/edit/main/content/mechanics/${m.meta.id}/${locale.code}.json"
            >${e(t.edit)} ↗</a
          >
        </div>
        <div class="lesson-overview-grid">
          <section id="overview" class="lesson-hero">
            <div class="lesson-topline">
              <span class="eyebrow"
                >${e(t.mechanicLabel)} ${String(m.meta.number).padStart(2, '0')}</span
              ><span>${e(c.category)}</span><span>${e(c.readTime)}</span>
            </div>
            <h1>
              ${e(c.title)}<span class="title-index" aria-hidden="true"
                >${String(m.meta.number).padStart(2, '0')}</span
              >
            </h1>
            <p class="hero-subtitle">${e(c.subtitle)}</p>
            <span class="variant">${e(c.variant)}</span>
            <p class="summary">${e(c.summary)}</p>
            <aside class="learning">
              <span class="eyebrow">${e(t.learnLabel)}</span>
              <p>${e(c.learning)}</p>
            </aside>
          </section>
          <div id="simulation" class="simulation-section">${a.render(c.demo)}</div>
        </div>
        <section id="playbook" class="content-section">
          <span class="eyebrow">01 / ${e(t.playbook)}</span>
          <h2>${e(t.stepsTitle)}</h2>
          <div class="steps-grid">${tiles(c.steps, 'step')}</div>
          <div class="mistakes">
            <h3>${e(t.mistakesTitle)}</h3>
            <div>${tiles(c.mistakes)}</div>
          </div>
        </section>
        <section id="design" class="content-section">
          <span class="eyebrow">02 / ${e(t.design)}</span>
          <h2>${e(t.designerTitle)}</h2>
          <div class="design-grid">${tiles(c.designNotes)}</div>
          <div class="context-grid">
            <article class="context story">
              <span class="eyebrow">${e(t.storyTitle)}</span>
              <h3>${e(c.story.title)}</h3>
              <p>${e(c.story.body)}</p>
            </article>
            <article class="context adaptation">
              <span class="eyebrow">${e(t.adaptTitle)}</span>
              <h3>${e(c.adaptation.title)}</h3>
              <p>${e(c.adaptation.body)}</p>
            </article>
          </div>
          <aside class="distinction">
            <h3>${e(c.distinction.title)}</h3>
            <p>${e(c.distinction.body)}</p>
          </aside>
        </section>
        <section id="concepts" class="content-section concepts-section">
          <span class="eyebrow">03 / ${e(t.concepts)}</span>
          <h2>${e(t.conceptsTitle)}</h2>
          <p class="concepts-intro">${e(t.conceptsIntro)}</p>
          <div class="concept-grid">
            ${c.concepts
              .map(
                (concept) =>
                  /* HTML */ `<article id="concept-${e(concept.id)}" class="concept-card">
                    <h3>${e(concept.title)}</h3>
                    <p>${e(concept.body)}</p>
                  </article>`,
              )
              .join('')}
          </div>
        </section>
        <section id="examples" class="content-section examples-section">
          <span class="eyebrow">04 / ${e(t.examples)}</span>
          <h2>${e(t.examplesTitle)}</h2>
          <p class="examples-intro">${e(t.examplesIntro)}</p>
          <div class="example-groups">
            ${exampleGroup('2D', t.games2D, c.examples, t)}
            ${exampleGroup('3D', t.games3D, c.examples, t)}
          </div>
        </section>
        <section id="sources" class="content-section sources">
          <span class="eyebrow">05 / ${e(t.sources)}</span>
          <h2>${e(t.sources)}</h2>
          <p>${e(t.sourceNote)}</p>
          <ul>
            ${m.meta.sources.map((s) => `<li><a href="${e(s.url)}">${e(s.title)} <span aria-hidden="true">↗</span></a></li>`).join('')}
          </ul>
          ${
            c.reviewStatus === 'needs-review'
              ? /* HTML */ `<p class="review-note">
                  ${e(t.reviewNote)}
                  <a
                    href="${REPOSITORY}/edit/main/content/mechanics/${m.meta.id}/${locale.code}.json"
                    >${e(t.edit)} ↗</a
                  >
                </p>`
              : ''
          }
        </section>
      </main>
    </div>`;
    await write(
      `${locale.code}/mechanics/${m.meta.id}/`,
      shell(locale, c.title, c.summary, body, {
        id: m.meta.id,
        assets: [...a.styles, ...a.scripts],
      }),
    );
  }
}
const languageLinks = locales
  .map(
    (l) =>
      `<a class="language-choice" href="${link(l.code + '/')}" lang="${l.code}" dir="${l.dir}"><span class="language-choice__label"><span class="language-flag" aria-hidden="true">${e(l.flag)}</span><span>${e(l.name)}</span></span><span aria-hidden="true">↗</span></a>`,
  )
  .join('');
const rootHtml = /* HTML */ `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      ${themeHead}
      <title>Boss Fight Atlas — Interactive boss mechanics</title>
      <meta
        name="description"
        content="An open encyclopedia of boss mechanics, with interactive animations in eight languages."
      />
      <link rel="canonical" href="${canonical()}" />
      <link rel="stylesheet" href="${asset('site.css')}" />
      <link rel="icon" href="${asset('favicon.svg')}" type="image/svg+xml" />
      <script type="module" src="${asset('site.mjs')}"></script>
    </head>
    <body class="language-home">
      ${themeButton('Switch to dark theme', 'Switch to light theme')}
      <main id="main">
        <span class="brand-mark" aria-hidden="true">✳</span>
        <p class="eyebrow">THE INTERACTIVE FIELD GUIDE</p>
        <h1>Boss Fight<br /><em>Atlas.</em></h1>
        <p class="lead">Design the fight. One mechanic at a time.</p>
        <nav class="language-choices" aria-label="Choose a language">${languageLinks}</nav>
        <p class="legal">
          Open educational materials · CC BY 4.0 · <a href="${REPOSITORY}">GitHub ↗</a>
        </p>
      </main>
    </body>
  </html>`;
await write('', rootHtml);
await fs.writeFile(
  path.join(out, '404.html'),
  rootHtml
    .replace(
      'Design the fight. One mechanic at a time.',
      'Page not found. Choose a language to return to the atlas.',
    )
    .replace(
      '<title>Boss Fight Atlas — Interactive boss mechanics</title>',
      '<title>Page not found · Boss Fight Atlas</title>',
    ),
);
await fs.writeFile(
  path.join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${e(url)}</loc></url>`).join('')}</urlset>`,
);
await fs.writeFile(
  path.join(out, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${canonical('sitemap.xml')}\n`,
);
console.log(`Built ${urls.length} pages at ${out}`);
