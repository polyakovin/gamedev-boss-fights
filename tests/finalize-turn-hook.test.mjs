import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const hook = fileURLToPath(new URL('../.codex/hooks/finalize-turn.mjs', import.meta.url));

function runHook(input) {
  return JSON.parse(
    execFileSync(process.execPath, [hook], {
      encoding: 'utf8',
      input: JSON.stringify(input),
    }),
  );
}

test('Stop hook requests one safe publication pass', () => {
  const result = runHook({ hook_event_name: 'Stop', stop_hook_active: false });

  assert.equal(result.decision, 'block');
  assert.match(result.reason, /stage only task-owned paths/);
  assert.match(result.reason, /GitHub Pages workflow/);
  assert.match(result.reason, /do not create an empty commit/);
});

test('Stop hook allows the continued turn to finish without looping', () => {
  assert.deepEqual(runHook({ hook_event_name: 'Stop', stop_hook_active: true }), {
    continue: true,
  });
});
