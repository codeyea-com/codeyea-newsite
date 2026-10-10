import "dotenv/config";
import { getStore } from "@netlify/blobs";
import { BlobNotFoundError, head, put } from "@vercel/blob";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const siteID = required("NETLIFY_SITE_ID");
const netlifyToken = required("NETLIFY_AUTH_TOKEN");
required("BLOB_READ_WRITE_TOKEN");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: required("DATABASE_URL") }) });
const sourceStores = ["codeyea-media-prod", "codeyea-media-preview"].map((name) =>
  getStore(name, { siteID, token: netlifyToken }),
);
const keyPattern = /^(?:media_)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/(?:thumb|small|medium|large)\.webp$/;

async function run() {
  let copied = 0;
  let alreadyPresent = 0;
  const missing: string[] = [];
  const assets = await db.mediaAsset.findMany({ where: { state: "READY" }, select: { variants: true } });
  const keys = new Set<string>();
  for (const asset of assets) {
    const variants = asset.variants as Record<string, { key?: unknown }>;
    for (const part of Object.values(variants)) {
      if (typeof part?.key === "string") keys.add(part.key);
    }
  }

  for (const key of keys) {
    if (!keyPattern.test(key)) throw new Error(`Refusing invalid media key: ${key}`);
    try {
      await head(key);
      alreadyPresent++;
      continue;
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) throw error;
    }

    let bytes: ArrayBuffer | undefined;
    for (const store of sourceStores) {
      bytes = await store.get(key, { type: "arrayBuffer" }) ?? undefined;
      if (bytes) break;
    }
    if (!bytes) {
      missing.push(key);
      continue;
    }

    await put(key, bytes, { access: "private", allowOverwrite: false, contentType: "image/webp" });
    copied++;
  }

  console.log(`Vercel media migration: ${copied} copied, ${alreadyPresent} already present, ${missing.length} missing.`);
  if (missing.length) {
    console.error(`Missing media keys:\n${missing.join("\n")}`);
    process.exitCode = 1;
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Media migration failed.");
  process.exitCode = 1;
}).finally(async () => {
  await db.$disconnect();
});
