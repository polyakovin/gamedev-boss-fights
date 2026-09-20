import fs from 'node:fs';

const publishReason = [
  'Before ending this turn, run the repository publication gate.',
  'Determine whether this user request changed this repository.',
  'If it did, inspect git status, run the canonical checks, stage only task-owned paths, create atomic commits, fetch and rebase when safe, and push the current branch without force.',
  'A push to main triggers .github/workflows/pages.yml; wait for that matching GitHub Pages workflow and verify that deployment succeeds.',
  'If no task-owned changes exist, do not create an empty commit or trigger a deployment.',
  'Never include unrelated pre-existing changes, generated dist, secrets, or credentials.',
  'Respect an explicit user request not to commit, push, or deploy, and report any blocker instead of bypassing it.',
].join(' ');

let input;
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.stdout.write(
    JSON.stringify({
      continue: true,
      systemMessage: 'Publication gate skipped because the Stop hook input was invalid.',
    }),
  );
  process.exit(0);
}

if (input.hook_event_name !== 'Stop' || input.stop_hook_active) {
  process.stdout.write(JSON.stringify({ continue: true }));
} else {
  process.stdout.write(JSON.stringify({ decision: 'block', reason: publishReason }));
}
