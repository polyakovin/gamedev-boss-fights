import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadContent, readJson } from '../lib/content.mjs';
const id = process.argv[2];
if (!id || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id))
  throw new Error('Usage: npm run new:mechanic -- kebab-case-slug');
const data = await loadContent();
const directory = path.join(ROOT, 'content/mechanics', id);
// Exclusive creation prevents accidental replacement of another mechanic.
await fs.mkdir(directory);
const source = await readJson('content/mechanics/charge/en.json');
function placeholders(value, key = '') {
  if (key === 'reviewStatus') return 'needs-review';
  if (key === 'sourceVersion') return 1;
  if (typeof value === 'string') return `TODO: ${key}`;
  if (Array.isArray(value)) return value.map((item, i) => placeholders(item, `${key}[${i}]`));
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, placeholders(v, k)]));
  return value;
}
const meta = {
  id,
  number: Math.max(0, ...data.mechanics.map((m) => m.meta.number)) + 1,
  published: false,
  sourceLocale: 'en',
  contentVersion: 1,
  animation: null,
  lenses: [],
  related: [],
  sources: [],
};
const lesson = placeholders(source);
lesson.lensNotes = [];
lesson.examples = [
  {
    dimension: '2D',
    game: 'TODO: game',
    boss: 'TODO: boss',
    screenshot: 'https://example.com/TODO-screenshot-2d.jpg',
    screenshotSource: 'https://example.com/TODO-screenshot-source-2d',
    body: 'TODO: design observation',
    video: 'https://www.youtube.com/watch?v=TODO-video-2d&t=1s',
    videoDurationSeconds: 180,
  },
  {
    dimension: '3D',
    game: 'TODO: game',
    boss: 'TODO: boss',
    screenshot: 'https://example.com/TODO-screenshot-3d.jpg',
    screenshotSource: 'https://example.com/TODO-screenshot-source-3d',
    body: 'TODO: design observation',
    video: 'https://www.youtube.com/watch?v=TODO-video-3d&t=1s',
    videoDurationSeconds: 180,
  },
];
await fs.writeFile(path.join(directory, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
await fs.writeFile(path.join(directory, 'en.json'), JSON.stringify(lesson, null, 2) + '\n');
console.log(
  `Created draft: content/mechanics/${id}/\nFill the English lesson, add translations and an animation, then set published: true. See docs/content-guide.md.`,
);
