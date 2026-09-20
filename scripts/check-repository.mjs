import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();

const files = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { cwd: root, encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean)
  .sort();

const localizedPathPatterns = [
  /^README\.(?:ar|bn|es|hi|ja|ru|zh-Hans)\.md$/,
  /^docs\/.+-(?:ar|bn|es|hi|ja|ru|zh-Hans)\.md$/,
  /^locales\/(?:ar|bn|en|es|hi|ja|registry|ru|zh-Hans)\.json$/,
  /^content\/(?:lenses|mechanics)\/[^/]+\/(?:ar|bn|es|hi|ja|ru|zh-Hans)\.json$/,
  /^content\/mechanics-index\.json$/,
  /^content\/mechanics-index-locales\/(?:ar|bn|es|hi|ja|ru|zh-Hans)\.json$/,
];
const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.svg',
  '.toml',
  '.txt',
  '.yaml',
  '.yml',
]);
const textFilenames = new Set(['.editorconfig', '.gitignore', '.node-version', '.prettierignore']);
const nonLatinLetterPattern = /(?:(?!\p{Script=Latin})\p{Letter})/u;

const duplicateGroups = new Map();
const nonEnglishFiles = [];
const nonEnglishFilenames = [];

for (const file of files) {
  const absolutePath = path.join(root, file);
  if (!statSync(absolutePath).isFile()) continue;
  if (nonLatinLetterPattern.test(file)) nonEnglishFilenames.push(file);

  const buffer = readFileSync(absolutePath);
  const hash = createHash('sha256').update(buffer).digest('hex');
  const group = duplicateGroups.get(hash) ?? [];
  group.push(file);
  duplicateGroups.set(hash, group);

  const isText = textExtensions.has(path.extname(file)) || textFilenames.has(path.basename(file));
  const isLocalization = localizedPathPatterns.some((pattern) => pattern.test(file));
  if (isText && !isLocalization && nonLatinLetterPattern.test(buffer.toString('utf8'))) {
    nonEnglishFiles.push(file);
  }
}

const exactDuplicates = [...duplicateGroups.values()].filter((group) => group.length > 1);

if (nonEnglishFiles.length || nonEnglishFilenames.length || exactDuplicates.length) {
  if (nonEnglishFiles.length) {
    console.error('Non-Latin script found outside localization files:');
    for (const file of nonEnglishFiles) console.error(`  - ${file}`);
  }

  if (nonEnglishFilenames.length) {
    console.error('Non-Latin file names found:');
    for (const file of nonEnglishFilenames) console.error(`  - ${file}`);
  }

  if (exactDuplicates.length) {
    console.error('Exact duplicate files found:');
    for (const group of exactDuplicates) {
      console.error(`  - ${group.join(', ')}`);
    }
  }

  process.exitCode = 1;
} else {
  console.log(
    `Repository hygiene: ${files.length} files checked; source text is English and no exact duplicates were found.`,
  );
}
