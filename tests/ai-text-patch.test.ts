import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyAiTextChanges } from '../src/content/ai-text-patch';
import { aiTextPatchSchema } from '../src/schemas/ai-assistant';

test('AI patch changes existing copy only and leaves protected structure untouched', () => {
  const source = { title: 'Before', homepage: { seo: { title: 'SEO title' }, cards: [{ title: 'Card', mediaId: 'protected' }] } };
  const changed = applyAiTextChanges(source, [{ path: 'homepage.cards.0.title', value: 'After' }]);
  assert.equal(changed.homepage.cards[0].title, 'After');
  assert.equal(changed.homepage.cards[0].mediaId, 'protected');
  assert.equal(source.homepage.cards[0].title, 'Card');
  assert.throws(() => applyAiTextChanges(source, [{ path: 'homepage.cards.0.mediaId', value: 'other' }]));
  assert.throws(() => applyAiTextChanges(source, [{ path: 'homepage.cards.0.unknown', value: 'other' }]));
});

test('proposal schema rejects duplicate paths and oversized change lists', () => {
  assert.equal(aiTextPatchSchema.safeParse({ summary: 'Improve page copy', changes: [{ path: 'title', value: 'A' }, { path: 'title', value: 'B' }] }).success, false);
  assert.equal(aiTextPatchSchema.safeParse({ summary: 'Improve page copy', changes: Array.from({ length: 21 }, (_, i) => ({ path: `sections.${i}.body`, value: 'Copy' })) }).success, false);
});
