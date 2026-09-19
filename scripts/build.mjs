import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadContent, validateContent } from '../lib/content.mjs';
import { animations } from '../lib/animations.mjs';
import { escape as e, jsonForHtml } from '../lib/html.mjs';
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
const urls = [];
async function write(route, html) {
  const dest = path.join(out, route, 'index.html');
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, html);
  urls.push(canonical(route));
}
function languages(active, id) {
  return /* HTML */ `<details class="language-menu">
    <summary>
      <span aria-hidden="true">◎</span> ${e(locales.find((l) => l.code === active).name)}
    </summary>
    <nav aria-label="${e(ui[active].language)}">
      ${locales.map((l) => `<a href="${link(l.code + '/' + (id ? `mechanics/${id}/` : ''))}" lang="${l.code}" hreflang="${l.code}" dir="${l.dir}"${l.code === active ? ' aria-current="page"' : ''}>${e(l.name)}${l.code === active ? '<span aria-hidden="true"> ✓</span>' : ''}</a>`).join('')}
    </nav>
  </details>`;
}
function shell(locale, title, description, body, { id, assets = [], catalog = false } = {}) {
  const t = ui[locale.code];
  const route = locale.code + '/' + (id ? `mechanics/${id}/` : '');
  return /* HTML */ `<!doctype html>
    <html lang="${locale.code}" dir="${locale.dir}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="color-scheme" content="light" />
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
        <link rel="icon" href="${link('assets/favicon.svg')}" type="image/svg+xml" />
        <link rel="stylesheet" href="${link('assets/site.css')}" />
        ${assets
          .filter((a) => a.endsWith('.css'))
          .map((a) => `<link rel="stylesheet" href="${link('assets/' + a)}">`)
          .join('')}
        <script type="module" src="${link('assets/site.mjs')}"></script>
        ${assets
          .filter((a) => a.endsWith('.mjs'))
          .map((a) => `<script type="module" src="${link('assets/' + a)}"></script>`)
          .join('')}
      </head>
      <body>
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
for (const locale of locales) {
  const t = ui[locale.code];
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
          <h2>${e(c.title)} <span aria-hidden="true">↗</span></h2>
          <p>${e(c.subtitle)}</p>
          <span class="text-link">${e(t.readLesson)} <span aria-hidden="true">→</span></span>
        </div></a
      >`;
    })
    .join('');
  const body = /* HTML */ `<main id="main" class="catalog-main">
    <section class="catalog-hero">
      <span class="eyebrow">${e(t.indexEyebrow)}</span>
      <h1>${e(t.indexTitle)}</h1>
      <p class="lead">${e(t.indexSubtitle)}</p>
      <div class="catalog-meta">
        <span class="small-dot"></span>${e(t.allLanguages)}<span class="meta-divider">/</span>CC BY
        4.0
      </div>
    </section>
    <section aria-label="${e(t.available)}">
      <div class="section-heading">
        <h2>${e(t.available)}</h2>
        <span class="count">${String(published.length).padStart(2, '0')}</span>
      </div>
      <div class="catalog-grid">
        ${cards}
        <aside class="contribution-card">
          <span class="big-plus" aria-hidden="true">+</span>
          <h2>${e(t.openSource)}</h2>
          <p>${e(t.soon)}</p>
          <p>${e(t.contributeText)}</p>
          <a class="text-link" href="${REPOSITORY}/blob/main/CONTRIBUTING.md"
            >${e(t.contribute)} ↗</a
          >
        </aside>
      </div>
    </section>
  </main>`;
  await write(
    locale.code + '/',
    shell(locale, t.catalog, t.indexSubtitle, body, { catalog: true }),
  );
  for (const m of published) {
    const c = m.translations[locale.code],
      a = animations[m.meta.animation];
    const nav = [
      ['overview', t.overview],
      ['simulation', t.simulation],
      ['playbook', t.playbook],
      ['design', t.design],
      ['quiz', t.quiz],
      ['sources', t.sources],
    ];
    const body = /* HTML */ `<div class="lesson-layout">
      <aside class="lesson-sidebar">
        <a class="back-link" href="${link(locale.code + '/')}">← ${e(t.catalog)}</a
        ><span class="eyebrow sidebar-caption">${e(t.onThisPage)}</span>
        <nav aria-label="${e(t.onThisPage)}">
          ${nav.map(([anchor, label], i) => `<a href="#${anchor}"><span aria-hidden="true">0${i + 1}</span>${e(label)}</a>`).join('')}
        </nav>
        <a
          class="sidebar-edit"
          href="${REPOSITORY}/edit/main/content/mechanics/${m.meta.id}/${locale.code}.json"
          >${e(t.edit)} ↗</a
        >
      </aside>
      <main id="main" class="lesson-main">
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
          <div class="intro-grid">
            <div>
              <span class="variant">${e(c.variant)}</span>
              <p class="summary">${e(c.summary)}</p>
            </div>
            <aside class="learning">
              <span class="eyebrow">${e(t.learnLabel)}</span>
              <p>${e(c.learning)}</p>
            </aside>
          </div>
        </section>
        <section id="simulation" class="simulation-section">${a.render(c.demo)}</section>
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
        <section id="quiz" class="content-section quiz-section">
          <div>
            <span class="eyebrow">${e(t.questionLabel)}</span>
            <h2>${e(t.quiz)}</h2>
          </div>
          <form class="quiz" data-quiz>
            <fieldset>
              <legend>${e(c.quiz.question)}</legend>
              ${c.quiz.options.map((option, i) => `<label class="quiz-option"><input type="radio" name="answer" value="${i}"><span>${e(option)}</span></label>`).join('')}
            </fieldset>
            <button type="submit">${e(t.answerButton)} <span aria-hidden="true">→</span></button>
            <p class="quiz-feedback" role="status" aria-live="polite"></p>
            <script type="application/json" class="quiz-data">
              ${jsonForHtml({ correctIndex: c.quiz.correctIndex, correct: t.correct, incorrect: t.incorrect, choose: t.chooseAnswer, explanation: c.quiz.explanation })}
            </script>
            <noscript
              ><details>
                <summary>${e(t.answerButton)}</summary>
                <p>${e(c.quiz.explanation)}</p>
              </details></noscript
            >
          </form>
        </section>
        <section id="sources" class="content-section sources">
          <span class="eyebrow">03 / ${e(t.sources)}</span>
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
      `<a class="language-choice" href="${link(l.code + '/')}" lang="${l.code}" dir="${l.dir}"><span>${e(l.name)}</span><span aria-hidden="true">↗</span></a>`,
  )
  .join('');
const rootHtml = /* HTML */ `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Boss Fight Atlas — Interactive boss mechanics</title>
      <meta
        name="description"
        content="An open encyclopedia of boss mechanics, with interactive animations in eight languages."
      />
      <link rel="canonical" href="${canonical()}" />
      <link rel="stylesheet" href="${link('assets/site.css')}" />
      <link rel="icon" href="${link('assets/favicon.svg')}" type="image/svg+xml" />
    </head>
    <body class="language-home">
      <main id="main">
        <span class="brand-mark" aria-hidden="true">✳</span>
        <p class="eyebrow">THE INTERACTIVE FIELD GUIDE</p>
        <h1>Boss Fight<br /><em>Atlas.</em></h1>
        <p class="lead">Understand the fight. One mechanic at a time.</p>
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
      'Understand the fight. One mechanic at a time.',
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
