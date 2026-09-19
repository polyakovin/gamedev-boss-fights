import fs from 'node:fs/promises';
import path from 'node:path';
import Ajv from 'ajv';
export const ROOT = path.resolve(import.meta.dirname, '..');
export async function readJson(file) {
  return JSON.parse(await fs.readFile(path.join(ROOT, file), 'utf8'));
}
export async function loadContent() {
  const locales = await readJson('locales/registry.json');
  const ui = Object.fromEntries(
    await Promise.all(
      locales.map(async ({ code }) => [code, await readJson(`locales/${code}.json`)]),
    ),
  );
  const dirs = await fs.readdir(path.join(ROOT, 'content/mechanics'), { withFileTypes: true });
  const mechanics = [];
  for (const dir of dirs.filter((d) => d.isDirectory())) {
    const prefix = `content/mechanics/${dir.name}`;
    const meta = await readJson(`${prefix}/meta.json`);
    const translations = {};
    for (const { code } of locales) {
      try {
        translations[code] = await readJson(`${prefix}/${code}.json`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    mechanics.push({ folder: dir.name, meta, translations });
  }
  mechanics.sort((a, b) => a.meta.number - b.meta.number);
  return { locales, ui, mechanics };
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
  for (const name of ['meta', 'lesson', 'ui'])
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
  for (const locale of data.locales) {
    if (locale.dir !== (locale.code === 'ar' ? 'rtl' : 'ltr'))
      errors.push(`${locale.code}: incorrect text direction`);
    validate('ui', data.ui[locale.code], `locales/${locale.code}`);
  }
  const numbers = new Set();
  const ids = new Set(data.mechanics.map((m) => m.meta.id));
  for (const { folder, meta, translations } of data.mechanics) {
    validate('meta', meta, `${folder}/meta`);
    if (meta.id !== folder) errors.push(`${folder}: id must match folder`);
    if (numbers.has(meta.number)) errors.push(`${folder}: duplicate mechanic number`);
    numbers.add(meta.number);
    for (const rel of meta.related)
      if (!ids.has(rel) || rel === meta.id)
        errors.push(`${folder}: invalid related mechanic ${rel}`);
    if (!translations.en) errors.push(`${folder}: English source required`);
    if (meta.published && !meta.animation)
      errors.push(`${folder}: published mechanic needs an animation`);
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
      if (lesson.quiz?.correctIndex !== translations.en?.quiz?.correctIndex)
        errors.push(`${folder}/${code}: quiz answer differs from source`);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return data;
}
