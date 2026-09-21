import test from 'node:test';
import assert from 'node:assert/strict';
import { createPageHistory } from '../lib/page-history.mjs';

const history = createPageHistory(`@@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\t2026-09-21

content/mechanics/charge/en.json
content/mechanics/charge/meta.json
@@bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\t2026-09-20

content/mechanics/charge/ru.json
content/lenses/commitment/en.json
`);

test('page history returns the newest commit that changed any page source', () => {
  assert.deepEqual(
    history.latest(['content/mechanics/charge/meta.json', 'content/mechanics/charge/ru.json']),
    {
      hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      date: '2026-09-21',
    },
  );
});

test('page history returns null when none of the page sources are committed', () => {
  assert.equal(history.latest(['content/mechanics/new-mechanic/en.json']), null);
});
