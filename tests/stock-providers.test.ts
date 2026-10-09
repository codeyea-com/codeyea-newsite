import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { searchInput } from '../src/server/stock/contracts';
import { searchPexels } from '../src/server/stock/pexels';
import { searchPixabay } from '../src/server/stock/pixabay';
import { downloadStock } from '../src/server/stock/download';
import { AppError } from '../src/server/errors';

const input = searchInput.parse({ query: 'health & care', provider: 'all', orientation: 'landscape' });
const pexels = { total_results: 22, photos: [{ id: 4, width: 2000, height: 1200, url: 'https://www.pexels.com/photo/test-4/', photographer: 'Contributor', photographer_url: 'https://www.pexels.com/@person/', alt: 'People working', src: { medium: 'https://images.pexels.com/photos/4/test.jpeg?w=400', large2x: 'https://images.pexels.com/photos/4/test.jpeg?w=1920' } }] };
const pixabay = { totalHits: 22, hits: [{ id: 5, imageWidth: 2000, imageHeight: 1200, pageURL: 'https://pixabay.com/photos/test-5/', user: 'Contributor', user_id: 7, tags: 'office, working', webformatURL: 'https://pixabay.com/get/test_640.jpg', largeImageURL: 'https://pixabay.com/get/test_1280.jpg' }] };
const json = (data: unknown) => async () => Response.json(data);
test('stock input rejects invalid provider, orientation, long queries and invalid pages', () => {
  for (const fields of [{ query: '' }, { query: 'a'.repeat(101) }, { page: 0 }, { page: 26 }, { provider: 'remote' }, { orientation: 'any' }, { unexpected: true }]) assert.throws(() => searchInput.parse({ ...input, ...fields }));
});
test('missing keys stop provider requests without disclosing values', async () => {
  for (const [name, adapter] of [['PEXELS_API_KEY', searchPexels], ['PIXABAY_API_KEY', searchPixabay]] as const) {
    const previous = process.env[name]; delete process.env[name]; let called = false;
    try { await assert.rejects(adapter(input, async () => { called = true; return Response.json({}); }), e => e instanceof AppError && e.message === `${name} unavailable`); assert.equal(called, false); }
    finally { if (previous !== undefined) process.env[name] = previous; }
  }
});
test('Pexels uses header authentication and encoded query, normalizes attribution', async () => {
  const previous = process.env.PEXELS_API_KEY; process.env.PEXELS_API_KEY = 'unit-fixture';
  try { const page = await searchPexels(input, async (url, init) => { const parsed = new URL(String(url)); assert.equal(parsed.searchParams.get('query'), input.query); assert.equal(parsed.searchParams.has('key'), false); assert.equal(new Headers(init?.headers).get('Authorization'), 'unit-fixture'); assert.equal(init?.redirect, 'error'); return Response.json(pexels); }); assert.equal(page.photos[0].providerId, '4'); assert.equal(page.photos[0].contributor, 'Contributor'); assert.equal(page.hasMore, true); }
  finally { if (previous === undefined) delete process.env.PEXELS_API_KEY; else process.env.PEXELS_API_KEY = previous; }
});
test('Pixabay requests safe photos and filters near-square results without fake cropping', async () => {
  const previous = process.env.PIXABAY_API_KEY; process.env.PIXABAY_API_KEY = 'unit-fixture';
  try { const page = await searchPixabay(input, async url => { const parsed = new URL(String(url)); assert.equal(parsed.searchParams.get('q'), input.query); assert.equal(parsed.searchParams.get('image_type'), 'photo'); assert.equal(parsed.searchParams.get('safesearch'), 'true'); return Response.json(pixabay); }); assert.equal(page.photos[0].provider, 'pixabay'); assert.equal(page.photos[0].width, 2000); assert.equal((await searchPixabay({ ...input, orientation: 'square' }, json(pixabay))).photos.length, 0); }
  finally { if (previous === undefined) delete process.env.PIXABAY_API_KEY; else process.env.PIXABAY_API_KEY = previous; }
});
test('provider errors never return raw response or credential-bearing fetch errors', async () => {
  const previous = process.env.PIXABAY_API_KEY; process.env.PIXABAY_API_KEY = 'unit-fixture';
  try { for (const fetcher of [async () => new Response('sensitive provider payload', { status: 429 }), async () => { throw new Error('https://pixabay.com/api/?key=sensitive'); }, json({ invalid: 'sensitive' })]) {
    await assert.rejects(searchPixabay(input, fetcher), e => e instanceof AppError && !e.message.includes('sensitive') && !e.message.includes('unit-fixture'));
  } } finally { if (previous === undefined) delete process.env.PIXABAY_API_KEY; else process.env.PIXABAY_API_KEY = previous; }
});
test('download rejects untrusted hosts, MIME mismatch, HTML, redirects and oversized payloads', async () => {
  const previous = process.env.PEXELS_API_KEY; process.env.PEXELS_API_KEY = 'unit-fixture';
  try { const photo = (await searchPexels(input, json(pexels))).photos[0];
    await assert.rejects(downloadStock({ ...photo, downloadUrl: 'https://127.0.0.1/private.jpg' }, false, async () => { assert.fail('SSRF request'); }), AppError);
    for (const response of [new Response('<html>bad</html>', { headers: { 'Content-Type': 'text/html' } }), new Response('bad', { headers: { 'Content-Type': 'image/png' } }), new Response('bad', { headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '9000000' } }), new Response(null, { status: 302 })]) await assert.rejects(downloadStock(photo, false, async () => response), AppError);
    const bytes = await sharp({ create: { width: 800, height: 400, channels: 3, background: 'white' } }).jpeg().toBuffer();
    const valid = await downloadStock(photo, false, async () => new Response(bytes, { headers: { 'Content-Type': 'image/jpeg' } })); assert.equal(valid.bytes.length, bytes.length);
  } finally { if (previous === undefined) delete process.env.PEXELS_API_KEY; else process.env.PEXELS_API_KEY = previous; }
});
