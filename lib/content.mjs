import fs from 'node:fs/promises';
import path from 'node:path';
import Ajv from 'ajv';
export const ROOT = path.resolve(import.meta.dirname, '..');
export async function readJson(file) {
  return JSON.parse(await fs.readFile(path.join(ROOT, file), 'utf8'));
}
async function loadCollection(collection, locales) {
  const dirs = await fs.readdir(path.join(ROOT, 'content', collection), { withFileTypes: true });
  const entries = [];
  for (const dir of dirs.filter((entry) => entry.isDirectory())) {
    const prefix = `content/${collection}/${dir.name}`;
    const meta = await readJson(`${prefix}/meta.json`);
    const translations = {};
    for (const { code } of locales) {
      try {
        translations[code] = await readJson(`${prefix}/${code}.json`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    entries.push({ folder: dir.name, meta, translations });
  }
  entries.sort((a, b) => a.meta.number - b.meta.number);
  return entries;
}
export async function loadContent() {
  const locales = await readJson('locales/registry.json');
  const ui = Object.fromEntries(
    await Promise.all(
      locales.map(async ({ code }) => [code, await readJson(`locales/${code}.json`)]),
    ),
  );
  const [mechanicsIndex, mechanicsExamplesSource, mechanicsIndexRu, mechanics, lenses] =
    await Promise.all([
      readJson('content/mechanics-index.json'),
      readJson('content/mechanics-examples.json'),
      readJson('content/mechanics-index-locales/ru.json'),
      loadCollection('mechanics', locales),
      loadCollection('lenses', locales),
    ]);
  const mechanicsExamples = {
    ...mechanicsExamplesSource,
    examples: mechanicsExamplesSource.examples.map((example) => ({
      ...example,
      translations: {
        ...example.translations,
        ru: mechanicsIndexRu.oriExamples?.[example.id],
      },
    })),
  };
  return { locales, ui, mechanicsIndex, mechanicsExamples, mechanics, lenses };
}
export async function validateContent(data) {
  const ajv = new Ajv({ allErrors: true });
  ajv.addFormat('https-url', (value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  });
  const validators = {};
  for (const name of [
    'meta',
    'lesson',
    'lens-meta',
    'lens',
    'ui',
    'mechanics-index',
    'mechanics-examples',
  ])
    validators[name] = ajv.compile(await readJson(`schemas/${name}.schema.json`));
  const errors = [];
  const validate = (kind, value, label) => {
    if (!validators[kind](value))
      errors.push(`${label}: ${ajv.errorsText(validators[kind].errors)}`);
  };
  const codes = new Set(data.locales.map((l) => l.code));
  if (
    data.locales.length !== 8 ||
    codes.size !== 8 ||
    !['en', 'ru', 'zh-Hans', 'hi', 'bn', 'es', 'ar', 'ja'].every((c) => codes.has(c))
  )
    errors.push('Locale registry must contain each of the eight supported locales exactly once.');
  const flags = new Set();
  for (const locale of data.locales) {
    if (locale.dir !== (locale.code === 'ar' ? 'rtl' : 'ltr'))
      errors.push(`${locale.code}: incorrect text direction`);
    if (!/^\p{Regional_Indicator}{2}$/u.test(locale.flag) || flags.has(locale.flag))
      errors.push(`${locale.code}: invalid or duplicate flag`);
    flags.add(locale.flag);
    validate('ui', data.ui[locale.code], `locales/${locale.code}`);
  }
  validate('mechanics-index', data.mechanicsIndex, 'content/mechanics-index');
  const indexIds = new Set();
  const indexNumbers = new Set();
  for (const mechanic of data.mechanicsIndex.mechanics) {
    if (indexIds.has(mechanic.id))
      errors.push(`content/mechanics-index: duplicate mechanic id ${mechanic.id}`);
    if (indexNumbers.has(mechanic.number))
      errors.push(`content/mechanics-index: duplicate mechanic number ${mechanic.number}`);
    indexIds.add(mechanic.id);
    indexNumbers.add(mechanic.number);
  }
  validate('mechanics-examples', data.mechanicsExamples, 'content/mechanics-examples');
  const exampleIds = new Set();
  const exampleKeys = new Set();
  for (const example of data.mechanicsExamples.examples) {
    if (exampleIds.has(example.id))
      errors.push(`content/mechanics-examples: duplicate example id ${example.id}`);
    exampleIds.add(example.id);
    if (!indexIds.has(example.mechanicId))
      errors.push(`content/mechanics-examples: unknown mechanic id ${example.mechanicId}`);
    const key = `${example.mechanicId}:${example.game}:${example.encounter}`;
    if (exampleKeys.has(key)) errors.push(`content/mechanics-examples: duplicate example ${key}`);
    exampleKeys.add(key);
  }
  const lensNumbers = new Set();
  const lensIds = new Set(data.lenses.map((lens) => lens.meta.id));
  for (const { folder, meta, translations } of data.lenses) {
    validate('lens-meta', meta, `lenses/${folder}/meta`);
    if (meta.id !== folder) errors.push(`lenses/${folder}: id must match folder`);
    if (lensNumbers.has(meta.number)) errors.push(`lenses/${folder}: duplicate lens number`);
    lensNumbers.add(meta.number);
    for (const related of meta.related)
      if (!lensIds.has(related) || related === meta.id)
        errors.push(`lenses/${folder}: invalid related lens ${related}`);
    if (!translations.en) errors.push(`lenses/${folder}: English source required`);
    for (const { code } of data.locales) {
      const lens = translations[code];
      if (!lens) {
        if (meta.published) errors.push(`lenses/${folder}: missing published translation ${code}`);
        continue;
      }
      validate('lens', lens, `lenses/${folder}/${code}`);
      if (meta.published && lens.sourceVersion !== meta.contentVersion)
        errors.push(`lenses/${folder}/${code}: sourceVersion is stale`);
      if (meta.published && /TODO:/.test(JSON.stringify(lens)))
        errors.push(`lenses/${folder}/${code}: unresolved placeholder`);
    }
  }
  const numbers = new Set();
  const ids = new Set(data.mechanics.map((m) => m.meta.id));
  for (const { folder, meta, translations } of data.mechanics) {
    validate('meta', meta, `${folder}/meta`);
    if (meta.id !== folder) errors.push(`${folder}: id must match folder`);
    if (meta.published && !indexIds.has(meta.id))
      errors.push(`${folder}: published mechanic is missing from public index`);
    if (numbers.has(meta.number)) errors.push(`${folder}: duplicate mechanic number`);
    numbers.add(meta.number);
    for (const rel of meta.related)
      if (!ids.has(rel) || rel === meta.id)
        errors.push(`${folder}: invalid related mechanic ${rel}`);
    for (const lensId of meta.lenses) {
      const lens = data.lenses.find((entry) => entry.meta.id === lensId);
      if (!lens || (meta.published && !lens.meta.published))
        errors.push(`${folder}: invalid or unpublished lens ${lensId}`);
    }
    if (!translations.en) errors.push(`${folder}: English source required`);
    if (meta.published && !meta.animation)
      errors.push(`${folder}: published mechanic needs an animation`);
    if (meta.published && meta.lenses.length === 0)
      errors.push(`${folder}: published mechanic needs at least one design lens`);
    for (const { code } of data.locales) {
      const lesson = translations[code];
      if (!lesson) {
        if (meta.published) errors.push(`${folder}: missing published translation ${code}`);
        continue;
      }
      validate('lesson', lesson, `${folder}/${code}`);
      if (meta.published && lesson.sourceVersion !== meta.contentVersion)
        errors.push(`${folder}/${code}: sourceVersion is stale`);
      if (meta.published && /TODO:/.test(JSON.stringify(lesson)))
        errors.push(`${folder}/${code}: unresolved placeholder`);
      for (const key of ['steps', 'mistakes', 'designNotes'])
        if (lesson[key]?.length !== translations.en?.[key]?.length)
          errors.push(`${folder}/${code}: ${key} length differs from source`);
      if (lesson.lensNotes?.length !== meta.lenses.length)
        errors.push(`${folder}/${code}: lensNotes length differs from mechanic lenses`);
      for (const [index, note] of (lesson.lensNotes ?? []).entries())
        if (note.id !== meta.lenses[index])
          errors.push(`${folder}/${code}: lens note ${index + 1} does not match mechanic lenses`);
      if (lesson.examples?.length !== translations.en?.examples?.length)
        errors.push(`${folder}/${code}: examples length differs from source`);
      if (meta.published && lesson.examples) {
        const dimensions = new Set(lesson.examples.map((example) => example.dimension));
        if (!dimensions.has('2D') || !dimensions.has('3D'))
          errors.push(`${folder}/${code}: examples must include both 2D and 3D games`);
      }
      for (const [index, example] of (lesson.examples ?? []).entries()) {
        const sourceExample = translations.en?.examples?.[index];
        if (
          code !== 'en' &&
          sourceExample &&
          [
            'dimension',
            'game',
            'boss',
            'screenshot',
            'screenshotSource',
            'video',
            'videoDurationSeconds',
          ].some((key) => example[key] !== sourceExample[key])
        )
          errors.push(`${folder}/${code}: example ${index + 1} differs from source`);
        if (meta.published) {
          try {
            const url = new URL(example.video);
            if (
              !['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname) ||
              (url.hostname !== 'youtu.be' &&
                (url.pathname !== '/watch' || !url.searchParams.get('v')))
            )
              errors.push(`${folder}/${code}: example ${index + 1} needs a YouTube video`);
            const timestamp = url.searchParams.get('t');
            if (!timestamp)
              errors.push(
                `${folder}/${code}: example ${index + 1} needs an exact YouTube timestamp`,
              );
            else if (!/^[1-9]\d*s$/.test(timestamp))
              errors.push(
                `${folder}/${code}: example ${index + 1} needs a YouTube t=<seconds>s timestamp`,
              );
            else if (Number.parseInt(timestamp, 10) >= example.videoDurationSeconds)
              errors.push(
                `${folder}/${code}: example ${index + 1} timestamp must be inside the video`,
              );
          } catch {
            // The schema reports malformed URLs.
          }
        }
      }
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return data;
}
