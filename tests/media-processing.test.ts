import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { processImage } from "../src/server/media-processing";
import { LocalMediaStorage } from "../src/server/media-storage";
import { AppError } from "../src/server/errors";

const fixture = () => sharp({ create: { width: 800, height: 400, channels: 3, background: "#336699" } });
test('stock metadata accepts recognized stripped XMP only; active content still fails', async () => {
  const original=await fixture().jpeg().toBuffer();
  function withXmp(text:string){const metadata=Buffer.from('http://ns.adobe.com/xap/1.0/\0'+text);const marker=Buffer.alloc(4);marker[0]=255;marker[1]=225;marker.writeUInt16BE(metadata.length+2,2);return Buffer.concat([original.subarray(0,2),marker,metadata,original.subarray(2)]);}
  const valid=withXmp('<x:xmpmeta xmlns:x="adobe:ns:meta/">Photo</x:xmpmeta>');
  await assert.rejects(processImage(valid,'photo.jpg'),AppError);
  const result=await processImage(valid,'photo.jpg',true);
  for(const variant of result.variants)assert.equal((await sharp(variant.data).metadata()).xmp,undefined);
  await assert.rejects(processImage(withXmp('<script>alert(1)</script>'),'photo.jpg',true),AppError);
});
test("JPEG, PNG, and WebP produce stripped WebP derivatives without upscale", async () => {
  for (const format of ["jpeg", "png", "webp"] as const) {
    const input = await fixture()[format]().toBuffer();
    const result = await processImage(input, `../example.${format}`);
    assert.equal(result.filename, `example.${format === "jpeg" ? "jpg" : format}`);
    assert.equal(result.size, input.length);
    assert.equal(result.mimeType, `image/${format}`);
    assert.deepEqual(result.variants.map(v => [v.width, v.height]), [[320,160],[640,320],[800,400],[800,400]]);
    for (const variant of result.variants) {
      const metadata = await sharp(variant.data).metadata();
      assert.equal(metadata.format, "webp");
      assert.equal(metadata.exif, undefined);
    }
  }
});
test("rejects forged types, trailing payloads, oversized bytes, and invalid dimensions", async () => {
  const invalid = (status: number) => (error: unknown) => error instanceof AppError && error.status === status;
  await assert.rejects(processImage(Buffer.from('<svg><script>alert(1)</script></svg>'), 'photo.png'), invalid(415));
  await assert.rejects(processImage(Buffer.alloc(8 * 1024 * 1024 + 1), 'photo.png'), invalid(413));
  for (const format of ["jpeg", "png", "webp"] as const) {
    const bytes = await fixture()[format]().toBuffer();
    await assert.rejects(processImage(Buffer.concat([bytes, Buffer.from('<?php evil();')]), 'photo.png'), invalid(415));
    await assert.rejects(processImage(bytes.subarray(0, bytes.length - 3), 'photo.png'), invalid(415));
  }
  const wide=await sharp({create:{width:8193,height:16,channels:3,background:"red"}}).png().toBuffer();
  await assert.rejects(processImage(wide,"wide.png"),invalid(400));
  const large=await sharp({create:{width:5000,height:5000,channels:3,background:"red"}}).png().toBuffer();
  await assert.rejects(processImage(large,"large.png"),AppError);
  const tiny = await sharp({ create: { width: 8, height: 8, channels: 3, background: "red" } }).png().toBuffer();
  await assert.rejects(processImage(tiny, "tiny.png"), invalid(400));
});
test("rejects script metadata and corrects EXIF orientation", async () => {
  const malicious = await fixture().withExif({ IFD0: { ImageDescription: '<script>alert(1)</script>' } }).jpeg().toBuffer();
  await assert.rejects(processImage(malicious, 'photo.jpg'), AppError);
  const rotated = await fixture().withMetadata({ orientation: 6 }).jpeg().toBuffer();
  const result = await processImage(rotated, 'photo.jpg');
  assert.equal(result.width, 400);
  assert.equal(result.height, 800);
  assert.deepEqual([result.variants[0].width, result.variants[0].height], [160, 320]);
  assert.ok(rotated.length);
});
test("private storage rejects traversal and collisions, round-trips and deletes exact files", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "codeyea-media-test-"));
  const storage = new LocalMediaStorage(root);
  const key = `${randomUUID()}/thumb.webp`;
  const bytes = await fixture().webp().toBuffer();
  await assert.rejects(storage.put('../escape.webp', bytes), AppError);
  await storage.put(key, bytes);
  try {
    assert.deepEqual(await storage.get(key), bytes);
    await assert.rejects(storage.put(key, Buffer.from('replacement')), { code: 'EEXIST' });
    assert.deepEqual(await storage.get(key), bytes);
  } finally { await storage.remove(key); await rm(root, { recursive: true, force: true }); }
  await assert.rejects(storage.get(key), { code: 'ENOENT' });
});

