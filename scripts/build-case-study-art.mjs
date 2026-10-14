import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const plan = JSON.parse(
  await fs.readFile("docs/CASE_STUDY_IMAGE_PLAN_20261014.json", "utf8"),
);
const results = JSON.parse(
  await fs.readFile("docs/CASE_STUDY_IMAGE_GENERATIONS_20261014.json", "utf8"),
);
const archiveRoot = path.resolve("../../Generated images/case-studies");
const selected = [];
for (const job of plan.jobs) {
  const result = results.find((r) => r.id === job.id);
  if (!result?.path) continue;
  const archive = path.join(archiveRoot, job.slug, "2026-10-14");
  const dest = `public/site/generated/case-studies/${job.slug}/${job.slot}-v1.webp`;
  await fs.mkdir(archive, { recursive: true });
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const original = path.join(archive, job.slot + "-original.png");
  await fs.copyFile(result.path, original);
  const info = await sharp(original)
    .resize({ width: 1440, withoutEnlargement: true })
    .webp({ quality: 88, effort: 6 })
    .toFile(dest);
  await fs.copyFile(dest, path.join(archive, job.slot + "-web.webp"));
  await fs.writeFile(
    path.join(archive, job.slot + "-generation.json"),
    JSON.stringify(
      {
        ...job,
        ...result,
        original,
        dest,
        width: info.width,
        height: info.height,
        bytes: info.size,
        mode: "built-in image_gen",
      },
      null,
      2,
    ),
  );
  selected.push({
    id: job.id,
    src: "/" + dest.slice(7),
    original,
    width: info.width,
    height: info.height,
    bytes: info.size,
  });
}
await fs.writeFile(
  "docs/SELECTED_CASE_STUDY_ASSETS_20261014.json",
  JSON.stringify(selected, null, 2) + "\n",
);
console.log({
  selected: selected.length,
  bytes: selected.reduce((s, i) => s + i.bytes, 0),
  archiveRoot,
});
