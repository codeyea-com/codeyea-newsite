import { mkdir, open, lstat, unlink } from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";
import { AppError } from "./errors";

export interface MediaStorage {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
}
const keyPattern = /^(?:media_)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/(?:thumb|small|medium|large)\.webp$/;

function validateKey(key: string) {
  if (!keyPattern.test(key)) throw new AppError(400, "Invalid media key");
}

/** Private local development adapter. Replace this interface with object storage for deployment. */
export class LocalMediaStorage implements MediaStorage {
  constructor(private readonly root: string) {}
  private async location(key: string, create: boolean) {
    validateKey(key);
    const root = path.resolve(this.root);
    const directory = path.join(root, key.split("/")[0]);
    if (create) await mkdir(root, { recursive: true });
    const rootInfo = await lstat(root);
    if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) throw new Error("Unsafe media directory");
    if (create) await mkdir(directory, { recursive: true });
    const directoryInfo = await lstat(directory);
    if (!directoryInfo.isDirectory() || directoryInfo.isSymbolicLink()) throw new Error("Unsafe media directory");
    return path.join(directory, key.split("/")[1]);
  }
  async put(key: string, data: Buffer) {
    const file = await this.location(key, true);
    const handle = await open(file, "wx", 0o600);
    try { await handle.writeFile(data); } finally { await handle.close(); }
  }
  async get(key: string) {
    const file = await this.location(key, false);
    const info = await lstat(file);
    if (!info.isFile() || info.isSymbolicLink()) throw new Error("Unsafe media file");
    const handle = await open(file, "r");
    try { return await handle.readFile(); } finally { await handle.close(); }
  }
  async remove(key: string) {
    try {
      const file = await this.location(key, false);
      const info = await lstat(file);
      if (!info.isFile() || info.isSymbolicLink()) throw new Error("Unsafe media file");
      await unlink(file);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}

/** Persistent CMS media for Netlify; deploy previews use a separate namespace. */
export class NetlifyBlobsMediaStorage implements MediaStorage {
  private store() {
    const name = process.env.CONTEXT === "production" ? "codeyea-media-prod" : "codeyea-media-preview";
    return getStore(name, { consistency: "strong" });
  }

  async put(key: string, data: Buffer) {
    validateKey(key);
    const copy = new Uint8Array(data.byteLength);
    copy.set(data);
    const result = await this.store().set(key, copy.buffer, { onlyIfNew: true });
    if (!result.modified) throw new AppError(409, "Media file already exists");
  }

  async get(key: string) {
    validateKey(key);
    const data = await this.store().get(key, { type: "arrayBuffer", consistency: "strong" });
    if (!data) throw new AppError(404, "Media file not found");
    return Buffer.from(data);
  }

  async remove(key: string) {
    validateKey(key);
    await this.store().delete(key);
  }
}

const localMediaStorage = new LocalMediaStorage(
  path.join(process.cwd(), ".local", process.env.CODEYEA_ENV === "test" ? "test-media" : "media"),
);

export const mediaStorage: MediaStorage = process.env.CODEYEA_ENV !== "test" && process.env.NETLIFY === "true"
  ? new NetlifyBlobsMediaStorage()
  : localMediaStorage;
