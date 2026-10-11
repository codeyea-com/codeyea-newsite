import { aboutCapabilityDescriptions } from "../src/content/about-capability-copy";
import { arabicIndustryServiceCopy } from "../src/content/arabic-industry-service-copy";
import { arabicIndustryProfiles } from "../src/content/arabic-industry-profiles";
import { config } from "dotenv";
import fs from "node:fs";
import { industryServiceCatalog } from "../src/content/industry-service-catalog";
import { snapshotSchema } from "../src/schemas/content";
config({ path: ".env", quiet: true });
// This preparation writes local drafts only. Publication is a separate owner review step.
if (
  !["localhost", "127.0.0.1"].includes(
    new URL(process.env.DATABASE_URL!).hostname,
  )
)
  throw new Error("Review preparation requires the local database");
const { db } = await import("../src/server/db");
const rows = await db.page.findMany({ where: { deletedAt: null } });
fs.mkdirSync(".local", { recursive: true });
const backup = ".local/oct10-draft-backup-" + Date.now() + ".json";
fs.writeFileSync(
  backup,
  JSON.stringify(
    rows.map((row) => ({ id: row.id, draftSnapshot: row.draftSnapshot })),
  ),
);
for (const row of rows) {
  const draft = snapshotSchema.parse(row.draftSnapshot);
  let changed = false;
  for (const section of draft.industryDetail?.sections ?? []) {
    if (section.type !== "services") continue;
    if (row.localeId === "ar") {
      const slug = draft.industryDetail!.slug;
      section.heading = `خدمات رقمية لقطاع ${arabicIndustryProfiles[slug].name}`;
      section.actionLabel = "خدمات رقمية";
      section.body = arabicIndustryServiceCopy[slug].join("\n\n");
    }
    section.items.forEach((item, index) => {
      const service = industryServiceCatalog[index];
      if (!service) throw new Error("Unexpected service collection size");
      item.title = service[row.localeId === "ar" ? 1 : 0];
      item.destination = (row.localeId === "ar" ? "/ar" : "") + service[2];
    });
    changed = true;
  }
  for (const section of draft.about?.sections ?? []) {
    if (section.type !== "projectReference") continue;
    section.items.forEach((item, index) => {
      item.body = aboutCapabilityDescriptions(row.localeId === "ar")[index];
    });
    changed = true;
  }
  if (draft.homepage) {
    for (const section of draft.sections) {
      if (section.type !== "positioning") continue;
      section.heading =
        row.localeId === "ar"
          ? "كوديا\nوكالة الابتكار الرقمي"
          : "CODEYEA\nDigital Innovation Agency";
      section.body =
        row.localeId === "ar"
          ? "نبني حضورًا رقميًا يوضح قيمة أعمالك، ويسهّل التواصل مع عملائك، ويدعم نموك."
          : "A clear digital presence that connects your business with customers and supports your next stage of growth.";
      changed = true;
    }
  }
  if (changed)
    await db.page.update({
      where: { id: row.id },
      data: {
        draftSnapshot: snapshotSchema.parse(draft),
        version: { increment: 1 },
      },
    });
}
console.log(
  "Local review drafts prepared; publication fields untouched. Backup:",
  backup,
);
await db.$disconnect();
