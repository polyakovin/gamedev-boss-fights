import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const commitLinePattern = /^@@([0-9a-f]{40})\t(\d{4}-\d{2}-\d{2})$/;

export function createPageHistory(log) {
  const files = new Map();
  let commit = null;
  let order = -1;

  for (const line of log.split('\n')) {
    const match = commitLinePattern.exec(line);
    if (match) {
      order += 1;
      commit = { hash: match[1], date: match[2], order };
      continue;
    }

    const file = line.trim();
    if (commit && file && !files.has(file)) files.set(file, commit);
  }

  return Object.freeze({
    latest(paths) {
      let latest = null;
      for (const path of paths) {
        const candidate = files.get(path);
        if (candidate && (!latest || candidate.order < latest.order)) latest = candidate;
      }
      return latest ? { hash: latest.hash, date: latest.date } : null;
    },
  });
}

export async function loadPageHistory(root) {
  const { stdout } = await execFileAsync(
    'git',
    [
      'log',
      '--format=@@%H%x09%cs',
      '--name-only',
      '--',
      'content/mechanics',
      'content/lenses',
      'content/mechanics-index.json',
      'content/mechanics-index-locales',
    ],
    { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  );
  return createPageHistory(stdout);
}
