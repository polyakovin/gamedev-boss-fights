import assert from 'node:assert/strict';
import test from 'node:test';
import { icon } from '../lib/icons.mjs';

test('Lucide icons render as accessible inline SVG without client-side setup', () => {
  const decorative = icon('arrow-right', { className: 'icon--directional' });
  assert.match(decorative, /class="icon icon--directional"/);
  assert.match(decorative, /viewBox="0 0 24 24"/);
  assert.match(decorative, /aria-hidden="true"/);
  assert.doesNotMatch(decorative, /data-lucide|<script/);

  const labelled = icon('download', { label: 'Download' });
  assert.match(labelled, /role="img" aria-label="Download"/);
  assert.doesNotMatch(labelled, /aria-hidden/);
});

test('unknown icon names fail during the static build', () => {
  assert.throws(() => icon('not-in-the-library'), /Unknown Lucide icon/);
});
