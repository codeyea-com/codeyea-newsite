import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import records from '../docs/WEBSITE_DESIGN_GENERATION_RECORDS.json';
import slots from '../docs/TEMPLATE_IMAGE_SLOTS.json';
import type { ServiceArtwork } from '../src/content/generated-service-artwork';

const registryPath = 'src/content/generated-service-artwork.json';
const registry = JSON.parse(await fs.readFile(registryPath, 'utf8')) as Record<string, Record<string, ServiceArtwork>>;
const selected: Record<string, ServiceArtwork> = {};
const manifest = [];
await fs.mkdir('public/site/generated/website-design', { recursive: true });
for (const job of records) {
  const output = `public/site/generated/website-design/${job.name}.webp`;
  const meta = await sharp(job.archive).metadata();
  assert(meta.width && meta.height, `Missing dimensions: ${job.name}`);
  assert(Math.abs(meta.width / meta.height - job.width / job.height) < 0.025, `Wrong generated composition: ${job.name}`);
  // Optimize without cropping, stretching, padding or changing the generated composition.
  await sharp(job.archive).webp({ quality: 88, effort: 5 }).toFile(output);
  await fs.copyFile(output, path.join(path.dirname(job.archive), path.basename(output)));
  const src = '/' + output.replace(/^public\//, '');
  if (job.variant === 'desktop') {
    const originalSource = slots['website-design'].find(s => s.n === job.index)?.source;
    selected[String(job.index)] = { src, ...(originalSource ? { originalSource } : {}), transparent: false, alt: job.alt };
  } else {
    assert(selected[String(job.index)], 'Desktop must precede its mobile version');
    selected[String(job.index)].mobileSrc = src;
  }
  manifest.push({ slot: job.index, variant: job.variant, src, width: meta.width, height: meta.height, bytes: (await fs.stat(output)).size, archive: job.archive });
}
assert.equal(Object.keys(selected).length, 15);
assert.equal(records.length, 16);
registry['website-design'] = selected;
await fs.writeFile(registryPath, JSON.stringify(registry, null, 2) + '\n');
await fs.writeFile('docs/WEBSITE_DESIGN_SELECTED_ASSETS.json', JSON.stringify(manifest, null, 2) + '\n');
await fs.copyFile('docs/WEBSITE_DESIGN_IMAGE_PLAN.json', path.join(path.dirname(records[0].archive), 'image-plan.json'));
console.log({ slots: Object.keys(selected).length, images: manifest.length, totalBytes: manifest.reduce((n, i) => n + i.bytes, 0) });
