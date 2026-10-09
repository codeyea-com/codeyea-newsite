import 'server-only';
import { createHash } from 'node:crypto';
import { db } from '../db';
import { requirePermission } from '../permissions';
import { AppError } from '../errors';
import { searchInput, type Provider, type SearchInput, type SearchPage, type StockPhoto } from './contracts';
import { searchPexels } from './pexels';
import { searchPixabay } from './pixabay';
import { downloadStock } from './download';
import { reserveUpload, uploadMedia } from '../media';
import { mediaStorage } from '../media-storage';
import { requireExternalStockSearchEnabled } from './config';

const adapters = { pexels: searchPexels, pixabay: searchPixabay };
const inFlight = new Map<string, Promise<SearchPage>>();
async function cached(input: SearchInput, provider: Provider) {
  const id = createHash('sha256').update(JSON.stringify([provider, input.query, input.orientation, input.page])).digest('hex');
  const entry = await db.stockSearchCache.findUnique({ where: { id } });
  if (entry && entry.expiresAt > new Date()) return { id, data: entry.response as unknown as SearchPage };
  let pending = inFlight.get(id);
  if (!pending) {
    pending = (async () => {
      return db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${id}, 731))`;
        const found = await tx.stockSearchCache.findUnique({ where: { id } });
        if (found && found.expiresAt > new Date()) return found.response as unknown as SearchPage;
        const data = await adapters[provider](input);
        const stored = { ...data, query: input.query };
        await tx.stockSearchCache.upsert({ where: { id }, create: { id, response: stored, expiresAt: new Date(Date.now() + 86400000) }, update: { response: stored, expiresAt: new Date(Date.now() + 86400000) } });
        return data;
      }, { timeout: 25000 });
    })().finally(() => inFlight.delete(id));
    inFlight.set(id, pending);
  }
  return { id, data: await pending };
}

export async function searchStock(actorId: string | null, input: unknown) {
  await requirePermission(actorId, 'manage_media');
  requireExternalStockSearchEnabled();
  const parsed = searchInput.parse(input);
  const quotaKey = `stock-search:${actorId}:${Math.floor(Date.now() / 60000)}`;
  const quota = await db.rateLimit.upsert({ where: { key: quotaKey }, create: { id: quotaKey, key: quotaKey, count: 1, lastRequest: BigInt(Date.now()) }, update: { count: { increment: 1 }, lastRequest: BigInt(Date.now()) } });
  if (quota.count > 30) throw new AppError(429, 'Stock search limit reached. Try again in one minute.');
  const providers: Provider[] = parsed.provider === 'all' ? ['pexels', 'pixabay'] : [parsed.provider];
  const results = await Promise.all(providers.map(async provider => {
    try {
      const { id, data } = await cached(parsed, provider);
      return { provider, hasMore: data.hasMore, photos: data.photos.map(({ previewUrl: _preview, downloadUrl: _download, ...photo }) => ({ ...photo, token: `${id}:${photo.providerId}`, preview: `/api/media/stock/preview?token=${id}:${photo.providerId}` })), error: null };
    } catch (error) { return { provider, hasMore: false, photos: [], error: error instanceof AppError ? error.message : 'This provider is temporarily unavailable.' }; }
  }));
  return { results, page: parsed.page };
}

export async function selectedStock(actorId: string | null, token: string): Promise<StockPhoto> {
  await requirePermission(actorId, 'manage_media');
  requireExternalStockSearchEnabled();
  if (!/^[a-f0-9]{64}:\d{1,20}$/.test(token)) throw new AppError(400, 'Invalid stock selection.');
  const [id, imageId] = token.split(':');
  const entry = await db.stockSearchCache.findUnique({ where: { id } });
  if (!entry || entry.expiresAt < new Date()) throw new AppError(409, 'This search expired. Search again before importing.');
  const photo = (entry.response as unknown as SearchPage).photos.find(p => p.providerId === imageId);
  if (!photo) throw new AppError(404, 'Stock selection not found.');
  return photo;
}

export async function importStock(actorId: string, token: string, alt: string, query: string) {
  const photo = await selectedStock(actorId, token);
  const cache = await db.stockSearchCache.findUnique({ where: { id: token.split(':')[0] } });
  const savedQuery = (cache?.response as { query?: string })?.query;
  if (savedQuery && query !== savedQuery) throw new AppError(400, 'Search query does not match this selection.');
  const identity = `${photo.provider}:${photo.providerId}`;
  const existing = await db.mediaAsset.findUnique({ where: { stockIdentity: identity } });
  if (existing) { if (existing.state !== 'READY' || existing.archivedAt) throw new AppError(409, 'This image is already in the library. Recover it or finish its pending cleanup.'); return { asset: existing, duplicate: true }; }
  await reserveUpload(actorId);
  const { bytes, filename } = await downloadStock(photo);
  const fileHash = createHash('sha256').update(bytes).digest('hex');
  const same = await db.mediaAsset.findUnique({ where: { fileHash } });
  if (same) { if (same.state !== 'READY' || same.archivedAt) throw new AppError(409, 'This image file already exists in the library. Recover it or finish its pending cleanup.'); return { asset: same, duplicate: true }; }
  const { previewUrl: _preview, downloadUrl: _download, ...metadata } = photo;
  const asset = await uploadMedia(actorId, bytes, filename, mediaStorage, { fileHash, stockIdentity: identity, alt, source: { ...metadata, originalWidth: photo.width, originalHeight: photo.height, importedAt: new Date().toISOString(), query, approvalStatus: 'temporary-stock' } });
  return { asset, duplicate: false };
}
