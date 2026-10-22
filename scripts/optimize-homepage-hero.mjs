import fs from 'node:fs/promises';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

// Preserve the approved artwork, aspect ratios and alpha; resize for its actual frames.
const directory = new URL('../public/homepage/services-hero/', import.meta.url);
const images = {
  'support-specialist': [320, 480, 640],
  'support-product': [128, 256],
  'phone-frame': [256, 480, 640],
  'campaign-sweatshirt': [320, 480, 640],
};
for (const [name, widths] of Object.entries(images)) {
  for (const width of widths) {
    const output = new URL(`${name}-${width}.webp`, directory);
    await sharp(await fs.readFile(new URL(`${name}.png`, directory)))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 86, alphaQuality: 100, effort: 6 })
      .toFile(fileURLToPath(output));
    console.log(`${name}-${width}.webp: ${(await fs.stat(output)).size} bytes`);
  }
}
for (const name of ['about', 'support', 'branding', 'ecommerce']) {
  const input = new URL(`../public/homepage/${name}.webp`, import.meta.url);
  for (const width of name === 'about' ? [640, 960] : [640]) {
    await sharp(await fs.readFile(input)).resize({ width }).webp({ quality:86, effort:6 })
      .toFile(fileURLToPath(new URL(`../public/homepage/${name}-${width}.webp`, import.meta.url)));
  }
}
const project = new URL('../public/site/generated/case-studies/iraq-home-expo/', import.meta.url);
for (const width of [640, 960, 1440]) {
  await sharp(await fs.readFile(new URL('hero-wide.png', project)))
    .resize({width, withoutEnlargement:true}).webp({quality:86, effort:6})
    .toFile(fileURLToPath(new URL(`hero-wide-${width}.webp`, project)));
}
