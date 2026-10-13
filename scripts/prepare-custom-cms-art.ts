import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import records from '../docs/CUSTOM_CMS_GENERATION_RECORDS.json';

const archive = path.resolve('../../Generated images/website-design/custom-cms-2026-10-13');
await fs.mkdir(archive, {recursive: true});
const selected = [];
for (const job of records) {
  const original = path.join(archive, job.id + '.png');
  await fs.copyFile(job.generatedPath, original);
  const metadata = await sharp(original).metadata();
  const [w,h] = job.ratio.split(':').map(Number);
  assert(metadata.width && metadata.height);
  assert(Math.abs(metadata.width / metadata.height - w / h) < .01, job.id + ' composition mismatch');
  const output = 'public/site/generated/website-design/' + job.id + '.webp';
  // Preserve the generated composition; only encode a smaller delivery file.
  await sharp(original).webp({quality: 88, effort: 5}).toFile(output);
  await fs.copyFile(output, path.join(archive, job.id + '.webp'));
  selected.push({id: job.id, src: '/' + output.replace(/^public\//,''), original, width: metadata.width, height: metadata.height, bytes: (await fs.stat(output)).size});
}
await fs.copyFile('docs/CUSTOM_CMS_IMAGE_PLAN.json', path.join(archive, 'image-plan.json'));
await fs.writeFile('docs/CUSTOM_CMS_SELECTED_ASSETS.json', JSON.stringify(selected, null, 2) + '\n');
console.log({images: selected.length, archive, bytes: selected.reduce((n,a)=>n+a.bytes,0)});
