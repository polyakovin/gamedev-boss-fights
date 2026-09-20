import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT, loadContent, validateContent } from '../lib/content.mjs';
import { animations } from '../lib/animations.mjs';
import { escape as e, jsonForHtml } from '../lib/html.mjs';
import { renderLensVisual } from '../lib/lens-view.mjs';
import { link, canonical, REPOSITORY } from '../lib/config.mjs';
const { locales, ui, mechanics, lenses } = await validateContent(await loadContent());
const published = mechanics.filter((m) => m.meta.published);
const publishedLenses = lenses.filter((lens) => lens.meta.published);
const lensById = new Map(publishedLenses.map((lens) => [lens.meta.id, lens]));
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
function languages(active, localizedPath = '') {
  const current = locales.find((locale) => locale.code === active);
  return /* HTML */ `<details class="language-menu">
    <summary>
      <span class="language-flag" aria-hidden="true">${e(current.flag)}</span>
      <span>${e(current.name)}</span>
    </summary>
    <nav aria-label="${e(ui[active].language)}">
      ${locales.map((l) => `<a href="${link(`${l.code}/${localizedPath}`)}" lang="${l.code}" hreflang="${l.code}" dir="${l.dir}"${l.code === active ? ' aria-current="page"' : ''}><span class="language-flag" aria-hidden="true">${e(l.flag)}</span><span>${e(l.name)}</span>${l.code === active ? '<span class="language-check" aria-hidden="true">✓</span>' : ''}</a>`).join('')}
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
const localeFontFamily = {
  'zh-Hans': 'Noto+Sans+SC',
  hi: 'Noto+Sans+Devanagari',
  bn: 'Noto+Sans+Bengali',
  ar: 'Noto+Sans+Arabic',
  ja: 'Noto+Sans+JP',
};
function fontHead(localeCode) {
  const families = [
    'family=IBM+Plex+Mono:wght@500;600',
    'family=Inter:wght@400;500;600;700',
    'family=Manrope:wght@500;600;700;800',
  ];
  const scriptFamily = localeFontFamily[localeCode];
  if (scriptFamily) families.push(`family=${scriptFamily}:wght@400;500;600;700`);
  const href = `https://fonts.googleapis.com/css2?${families.join('&amp;')}&amp;display=swap`;
  return /* HTML */ `<link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${href}" />`;
}
function shell(
  locale,
  title,
  description,
  body,
  {
    route: localizedPath = '',
    assets = [],
    catalog = false,
    builderPage = false,
    pageClass = '',
  } = {},
) {
  const t = ui[locale.code];
  const route = `${locale.code}/${localizedPath}`;
  return /* HTML */ `<!doctype html>
    <html lang="${locale.code}" dir="${locale.dir}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        ${themeHead}
        <title>${e(title)} · Boss Fight Atlas</title>
        <meta name="description" content="${e(description)}" />
        <link rel="canonical" href="${canonical(route)}" />
        ${locales.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${canonical(`${l.code}/${localizedPath}`)}">`).join('')}
        <link
          rel="alternate"
          hreflang="x-default"
          href="${canonical(`en/${localizedPath}`)}"
        />
        <meta property="og:title" content="${e(title)} · Boss Fight Atlas" />
        <meta property="og:description" content="${e(description)}" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="${canonical(route)}" />
        ${fontHead(locale.code)}
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
      <body${catalog || pageClass ? ` class="${[catalog ? 'catalog-page' : '', pageClass].filter(Boolean).join(' ')}"` : ''}>
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
              ><a
                class="builder-link"
                href="${link(`${locale.code}/builder/`)}"
                ${builderPage ? ' aria-current="page"' : ''}
                >${e(t.builder)}</a
              ><a class="contribute-link" href="${REPOSITORY}/blob/main/CONTRIBUTING.md"
                >${e(t.contribute)} <span aria-hidden="true">↗</span></a
              >
            </nav>
            ${themeButton(t.themeDark, t.themeLight)}
            ${languages(locale.code, localizedPath)}
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
function checklistItems(items, group) {
  return items
    .map(
      (item, index) =>
        /* HTML */ `<li>
          <div class="checklist-item">
            <input
              class="checklist-checkbox"
              type="checkbox"
              value="${e(`${group}-${index}`)}"
              data-checklist-checkbox
              aria-label="${e(item.title)}"
            />
            <details>
              <summary>
                <span>${e(item.title)}</span>
                <span class="checklist-toggle" aria-hidden="true">+</span>
              </summary>
              <p>${e(item.body)}</p>
            </details>
          </div>
        </li>`,
    )
    .join('');
}
function lensChips(localeCode, ids, notes) {
  const t = ui[localeCode];
  const notesById = new Map(notes.map((note) => [note.id, note.body]));
  return /* HTML */ `<nav class="lens-chips" aria-label="${e(t.mechanicLenses)}">
    ${ids
      .map((id) => {
        const lens = lensById.get(id);
        if (!lens) throw new Error(`Unknown published lens: ${id}`);
        const content = lens.translations[localeCode];
        const note = notesById.get(id);
        if (!note) throw new Error(`Missing ${localeCode} lens note: ${id}`);
        const tooltipId = `lens-tooltip-${id}`;
        return /* HTML */ `<a
          class="lens-chip"
          href="${link(`${localeCode}/lenses/${id}/`)}"
          aria-describedby="${tooltipId}"
          ><span>${e(content.title)}</span
          ><span id="${tooltipId}" class="lens-chip__tooltip" role="tooltip">${e(note)}</span></a
        >`;
      })
      .join('')}
  </nav>`;
}
function exampleGroup(dimension, label, items, t) {
  const cards = items
    .filter((item) => item.dimension === dimension)
    .map(
      (item) =>
        /* HTML */ `<article class="game-example">
          <figure class="game-example__media">
            <img
              src="${e(item.screenshot)}"
              alt="${e(`${item.boss} — ${item.game}`)}"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
            />
            <figcaption>
              <a
                class="game-example__source"
                href="${e(item.screenshotSource)}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="${e(`${t.screenshotSource}: ${item.boss}, ${item.game}`)}"
                >${e(t.screenshotSource)} <span aria-hidden="true">↗</span></a
              >
            </figcaption>
          </figure>
          <div class="game-example__body">
            <span class="game-example__game">${e(item.game)}</span>
            <h4>${e(item.boss)}</h4>
            <p>${e(item.body)}</p>
            <a
              class="game-example__video"
              href="${e(item.video)}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="${e(`${t.watchVideo}: ${item.boss}, ${item.game}`)}"
              ><span aria-hidden="true">▶</span>${e(t.watchVideo)}<span aria-hidden="true"
                >↗</span
              ></a
            >
          </div>
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
      href: link(`${locale.code}/lenses/`),
      count: publishedLenses.length,
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
          ${animations[m.meta.animation].thumbnail(m.meta.id)}
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
        ${featuredContent ? `<p class="atlas-map__intro">${e(t.siteMapIntro)}: <a href="${link(lessonPath)}">${e(featuredContent.title)}</a> <span aria-hidden="true">·</span> <a class="atlas-map__builder" href="${link(`${locale.code}/builder/`)}">${e(t.builder)} <span aria-hidden="true">→</span></a></p>` : ''}
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
  const builderMechanics = published.map((mechanic) => {
    const content = mechanic.translations[locale.code];
    return {
      id: mechanic.meta.id,
      title: content.title,
      category: content.category,
      summary: content.summary,
      url: canonical(`${locale.code}/mechanics/${mechanic.meta.id}/`),
    };
  });
  const builderCards = published
    .map((mechanic) => {
      const content = mechanic.translations[locale.code];
      return /* HTML */ `<article class="boss-builder-mechanic">
        <label class="boss-builder-mechanic__select">
          <input type="checkbox" value="${e(mechanic.meta.id)}" data-boss-mechanic />
          <span class="boss-builder-mechanic__check" aria-hidden="true">✓</span>
          <span class="boss-builder-mechanic__diagram" aria-hidden="true">
            ${animations[mechanic.meta.animation].thumbnail(mechanic.meta.id)}
          </span>
          <span class="boss-builder-mechanic__copy">
            <span class="eyebrow">${e(content.category)}</span>
            <strong>${e(content.title)}</strong>
            <span>${e(content.summary)}</span>
          </span>
        </label>
        <a href="${link(`${locale.code}/mechanics/${mechanic.meta.id}/`)}">
          ${e(t.readLesson)} <span aria-hidden="true">→</span>
        </a>
      </article>`;
    })
    .join('');
  const builderConfig = {
    locale: locale.code,
    mechanics: builderMechanics,
    messages: {
      selected: t.builderSelected,
      saved: t.builderSaved,
      cleared: t.builderCleared,
      nameRequired: t.builderNameRequired,
      mechanicRequired: t.builderMechanicRequired,
    },
  };
  const builderBody = /* HTML */ `<main id="main" class="boss-builder-main" data-boss-builder>
    <header class="boss-builder-hero">
      <span class="eyebrow">${e(t.builder)}</span>
      <h1>${e(t.builderTitle)}</h1>
      <p>${e(t.builderIntro)}</p>
      <span class="boss-builder-storage">${e(t.builderStorageNote)}</span>
    </header>
    <div class="boss-builder-layout">
      <section class="boss-builder-form" aria-label="${e(t.builderTitle)}">
        <label class="boss-builder-field">
          <span>${e(t.builderName)}</span>
          <input
            type="text"
            maxlength="120"
            autocomplete="off"
            placeholder="${e(t.builderNamePlaceholder)}"
            data-boss-name
          />
        </label>
        <label class="boss-builder-field">
          <span>${e(t.builderDescription)}</span>
          <textarea
            maxlength="2000"
            rows="8"
            placeholder="${e(t.builderDescriptionPlaceholder)}"
            data-boss-description
          ></textarea>
        </label>
        <div class="boss-builder-actions">
          <button type="button" class="boss-builder-download" data-boss-download>
            ${e(t.builderDownload)}
          </button>
          <button type="button" class="boss-builder-reset" data-boss-reset disabled>
            ${e(t.builderReset)}
          </button>
        </div>
        <p class="boss-builder-status" role="status" aria-live="polite" data-boss-status></p>
      </section>
      <section class="boss-builder-mechanics" aria-labelledby="boss-builder-mechanics-title">
        <div class="boss-builder-mechanics__heading">
          <div>
            <span class="eyebrow">${e(t.builderSelected)}</span>
            <h2 id="boss-builder-mechanics-title">${e(t.catalog)}</h2>
          </div>
          <span data-boss-selected>${e(t.builderSelected)}: 0</span>
        </div>
        <p>${e(t.builderMechanicsIntro)}</p>
        <div class="boss-builder-mechanics__grid">${builderCards}</div>
      </section>
    </div>
    <script type="application/json" data-boss-builder-config>
      ${jsonForHtml(builderConfig)}
    </script>
  </main>`;
  await write(
    `${locale.code}/builder/`,
    shell(locale, t.builderTitle, t.builderIntro, builderBody, {
      route: 'builder/',
      assets: ['boss-builder.mjs'],
      builderPage: true,
      pageClass: 'boss-builder-page',
    }),
  );
  for (const m of published) {
    const c = m.translations[locale.code],
      a = animations[m.meta.animation];
    const body = /* HTML */ `<div class="lesson-layout">
      <main id="main" class="lesson-main">
        <div class="lesson-overview-grid">
          <section id="overview" class="lesson-hero">
            <a class="eyebrow lesson-category" href="${link(`${locale.code}/#mechanics`)}"
              >${e(c.category)}</a
            >
            <div class="lesson-title-line">
              <h1>${e(c.title)}</h1>
              ${lensChips(locale.code, m.meta.lenses, c.lensNotes)}
            </div>
            <p class="mechanic-overview">${e(c.overview)}</p>
            <section
              class="implementation-checklist"
              aria-labelledby="implementation-checklist-title"
              data-checklist-id="${e(m.meta.id)}"
            >
              <div class="implementation-checklist__intro">
                <h2 id="implementation-checklist-title">${e(t.implementationChecklist)}</h2>
                <p>${e(c.learning)}</p>
                <button type="button" class="checklist-reset" data-checklist-reset disabled>
                  ${e(t.checklistReset)}
                </button>
              </div>
              <div class="implementation-checklist__groups">
                <section class="checklist-group" aria-labelledby="core-checks-title">
                  <span class="eyebrow">${e(t.playbook)}</span>
                  <h3 id="core-checks-title">${e(t.stepsTitle)}</h3>
                  <ul class="checklist-items">
                    ${checklistItems(c.steps, 'steps')}
                  </ul>
                  <h4>${e(t.mistakesTitle)}</h4>
                  <ul class="checklist-items checklist-items--mistakes">
                    ${checklistItems(c.mistakes, 'mistakes')}
                  </ul>
                </section>
                <section class="checklist-group" aria-labelledby="tuning-title">
                  <span class="eyebrow">${e(t.design)}</span>
                  <h3 id="tuning-title">${e(t.designerTitle)}</h3>
                  <ul class="checklist-items">
                    ${checklistItems(c.designNotes, 'design')}
                  </ul>
                  <h4>${e(t.storyTitle)}</h4>
                  <ul class="checklist-items">
                    ${checklistItems([c.story], 'story')}
                  </ul>
                  <h4>${e(t.adaptTitle)}</h4>
                  <ul class="checklist-items">
                    ${checklistItems([c.adaptation], 'adaptation')}
                  </ul>
                  <h4>${e(t.relatedTitle)}</h4>
                  <ul class="checklist-items">
                    ${checklistItems([c.distinction], 'distinction')}
                  </ul>
                </section>
              </div>
            </section>
          </section>
          <div id="simulation" class="simulation-section">${a.render(c.demo)}</div>
        </div>
        <section id="examples" class="content-section examples-section">
          <span class="eyebrow">01 / ${e(t.examples)}</span>
          <h2>${e(t.examplesTitle)}</h2>
          <p class="examples-intro">${e(t.examplesIntro)}</p>
          <div class="example-groups">
            ${exampleGroup('2D', t.games2D, c.examples, t)}
            ${exampleGroup('3D', t.games3D, c.examples, t)}
          </div>
        </section>
        <section id="sources" class="content-section sources">
          <span class="eyebrow">02 / ${e(t.sources)}</span>
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
        route: `mechanics/${m.meta.id}/`,
        assets: [...a.styles, ...a.scripts],
      }),
    );
  }
  const lensCards = publishedLenses
    .map((lens) => {
      const content = lens.translations[locale.code];
      const mechanicCount = published.filter((mechanic) =>
        mechanic.meta.lenses.includes(lens.meta.id),
      ).length;
      return /* HTML */ `<a
        class="lens-card"
        href="${link(`${locale.code}/lenses/${lens.meta.id}/`)}"
      >
        ${renderLensVisual(lens.meta.id, content, { compact: true })}
        <span class="eyebrow">${e(t.lensLabel)}</span>
        <h2>${e(content.title)} <span aria-hidden="true">→</span></h2>
        <p>${e(content.summary)}</p>
        <span class="lens-card__count">${e(t.lensMechanicsTitle)} · ${mechanicCount}</span>
      </a>`;
    })
    .join('');
  const lensCatalogBody = /* HTML */ `<main id="main" class="lens-catalog-main">
    <header class="lens-catalog-hero">
      <span class="eyebrow">${e(t.concepts)}</span>
      <h1>${e(t.conceptsTitle)}</h1>
      <p>${e(t.conceptsIntro)}</p>
    </header>
    <div class="lens-catalog-grid">${lensCards}</div>
  </main>`;
  await write(
    `${locale.code}/lenses/`,
    shell(locale, t.conceptsTitle, t.conceptsIntro, lensCatalogBody, {
      route: 'lenses/',
      pageClass: 'lens-catalog-page',
    }),
  );
  for (const lens of publishedLenses) {
    const content = lens.translations[locale.code];
    const usedBy = published.filter((mechanic) => mechanic.meta.lenses.includes(lens.meta.id));
    const mechanicLinks = usedBy
      .map((mechanic) => {
        const mechanicContent = mechanic.translations[locale.code];
        return /* HTML */ `<a
          class="lens-mechanic-card"
          href="${link(`${locale.code}/mechanics/${mechanic.meta.id}/`)}"
        >
          <span class="eyebrow">${e(mechanicContent.category)}</span>
          <h2>${e(mechanicContent.title)} <span aria-hidden="true">→</span></h2>
          <p>${e(mechanicContent.summary)}</p>
        </a>`;
      })
      .join('');
    const relatedLinks = lens.meta.related
      .map((id) => {
        const related = lensById.get(id);
        const relatedContent = related?.translations[locale.code];
        if (!relatedContent) return '';
        return `<a class="lens-chip" href="${link(`${locale.code}/lenses/${id}/`)}"><span>${e(relatedContent.title)}</span></a>`;
      })
      .join('');
    const body = /* HTML */ `<main id="main" class="lens-main">
      <article class="lens-page">
        <header class="lens-page__hero">
          <div class="lens-page__copy">
            <span class="eyebrow">${e(t.lensLabel)}</span>
            <h1>${e(content.title)}</h1>
            <p>${e(content.summary)}</p>
          </div>
          ${renderLensVisual(lens.meta.id, content)}
        </header>
        <section class="lens-page__mechanics" aria-labelledby="lens-mechanics-title">
          <span class="eyebrow">${e(t.catalog)}</span>
          <h2 id="lens-mechanics-title">${e(t.lensMechanicsTitle)}</h2>
          <div>${mechanicLinks}</div>
        </section>
        ${
          relatedLinks
            ? `<nav class="lens-page__related" aria-label="${e(t.relatedTitle)}"><span class="eyebrow">${e(t.relatedTitle)}</span><div class="lens-chips">${relatedLinks}</div></nav>`
            : ''
        }
        ${
          lens.meta.sources.length
            ? `<section class="sources lens-page__sources"><span class="eyebrow">${e(t.sources)}</span><h2>${e(t.sources)}</h2><ul>${lens.meta.sources.map((source) => `<li><a href="${e(source.url)}">${e(source.title)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul></section>`
            : ''
        }
        ${
          content.reviewStatus === 'needs-review'
            ? `<p class="review-note lens-page__review">${e(t.reviewNote)} <a href="${REPOSITORY}/edit/main/content/lenses/${lens.meta.id}/${locale.code}.json">${e(t.edit)} ↗</a></p>`
            : ''
        }
      </article>
    </main>`;
    await write(
      `${locale.code}/lenses/${lens.meta.id}/`,
      shell(locale, content.title, content.summary, body, {
        route: `lenses/${lens.meta.id}/`,
        pageClass: 'lens-page-body',
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
