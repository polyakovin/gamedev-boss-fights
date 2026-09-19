import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadContent } from '../lib/content.mjs';

const id = process.argv[2];
if (!id || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id))
  throw new Error('Usage: npm run new:lens -- kebab-case-slug');

const data = await loadContent();
const directory = path.join(ROOT, 'content/lenses', id);
await fs.mkdir(directory);

const meta = {
  id,
  number: Math.max(0, ...data.lenses.map((lens) => lens.meta.number)) + 1,
  published: false,
  sourceLocale: 'en',
  contentVersion: 1,
  related: [],
  sources: [],
};
const lens = {
  title: 'TODO: title',
  summary: 'TODO: explain what this lens reveals and what a designer should inspect',
  reviewStatus: 'needs-review',
  sourceVersion: 1,
};

await fs.writeFile(path.join(directory, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
await fs.writeFile(path.join(directory, 'en.json'), `${JSON.stringify(lens, null, 2)}\n`);
console.log(
  `Created draft: content/lenses/${id}/\nFill the English lens, add translations, then set published: true. See docs/content-guide.md.`,
);
