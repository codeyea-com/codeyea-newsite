import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const jobs = JSON.parse(await fs.readFile('docs/HERO_LIGHT_GENERATIONS_20261014.json', 'utf8'));
const industryFile = 'src/content/generated-artwork.json';
const generalFile = 'src/content/generated-general-artwork.json';
const industry = JSON.parse(await fs.readFile(industryFile, 'utf8'));
const general = JSON.parse(await fs.readFile(generalFile, 'utf8'));
const selected = [];
for (const job of jobs) {
  const group = job.page === 'about' ? 'general' : job.page === 'technical-support' ? 'services' : 'industries';
  const stem = `hero-light-v1-${job.variant}`;
  const folder = `public/site/generated/${group}/${job.page}`;
  const archive = `C:/Users/grdez/Documents/codex-projects/codeyea/Generated images/${job.page}/hero-light-2026-10-14`;
  await fs.mkdir(folder, { recursive: true });
  await fs.mkdir(archive, { recursive: true });
  await fs.copyFile(job.path, `${archive}/${stem}.png`);
  const output = `${folder}/${stem}.webp`;
  await sharp(job.path).webp({ quality: 90, effort: 5 }).toFile(output);
  const metadata = await sharp(output).metadata();
  const src = '/' + output.replace(/^public\//, '');
  const property = job.variant === 'mobile' ? 'mobileSrc' : job.variant === 'tablet' ? 'tabletSrc' : 'src';
  if (group === 'industries') {
    for (const lang of ['en', 'ar']) {
      const entry = industry[`generated-${job.page}-hero-${lang}`];
      if (!entry) throw Error('Missing hero registry: ' + job.page);
      entry[property] = src;
      if (property === 'src') {
        entry.width = metadata.width;
        entry.height = metadata.height;
      }
    }
  } else if (group === 'general') {
    general[`${job.page}/hero`][property] = src;
    general[`${job.page}/hero`].alt = { en: 'Digital agency project planning on a naturally light worktable', ar: 'تخطيط التصميم والتطوير على طاولة عمل فاتحة بإضاءة طبيعية' };
  }
  selected.push({ ...job, output, width: metadata.width, height: metadata.height, bytes: (await fs.stat(output)).size });
}
await fs.writeFile(industryFile, JSON.stringify(industry, null, 2) + '\n');
await fs.writeFile(generalFile, JSON.stringify(general, null, 2) + '\n');
await fs.writeFile('docs/SELECTED_LIGHT_HERO_ASSETS_20261014.json', JSON.stringify(selected, null, 2) + '\n');
console.log({ integrated: selected.length, originalPhotographyPreserved: true });
