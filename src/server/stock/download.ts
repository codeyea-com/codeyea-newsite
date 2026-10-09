import sharp from 'sharp';
import { AppError } from '../errors';
import { providerUrl } from './transport';
import type { StockPhoto } from './contracts';

export async function downloadStock(photo: StockPhoto, preview = false, fetcher: typeof fetch = fetch) {
  try {
    const url = providerUrl(preview ? photo.previewUrl : photo.downloadUrl,
      photo.provider === 'pexels' ? ['images.pexels.com'] : ['pixabay.com', 'cdn.pixabay.com']);
    const extension = new URL(url).pathname.match(/\.(jpe?g|png|webp)$/i)?.[1]?.toLowerCase();
    if (!extension) throw new AppError(415, 'Unsupported stock image format.');
    const response = await fetcher(url, { signal: AbortSignal.timeout(20000), redirect: 'error', cache: 'no-store' });
    if (!response.ok) throw new AppError(502, 'The stock image could not be downloaded. Search again.');
    const mime = response.headers.get('content-type')?.split(';')[0].trim();
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime ?? '')) throw new AppError(415, 'Unsupported stock image payload.');
    const expected = extension === 'jpg' || extension === 'jpeg' ? 'jpeg' : extension;
    if (mime !== `image/${expected}`) throw new AppError(415, 'Stock image type does not match its extension.');
    const limit = 8 * 1024 * 1024;
    if (Number(response.headers.get('content-length')) > limit) throw new AppError(413, 'Stock image exceeds 8 MiB.');
    const reader = response.body?.getReader(); if (!reader) throw new AppError(502, 'Stock image is empty.');
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length;
      if (size > limit) { await reader.cancel(); throw new AppError(413, 'Stock image exceeds 8 MiB.'); } chunks.push(value);
    }
    const bytes = Buffer.concat(chunks);
    const meta = await sharp(bytes, { limitInputPixels: 24000000, failOn: 'warning' }).metadata();
    if (meta.format !== expected || (meta.pages ?? 1) !== 1 || !meta.width || !meta.height || meta.width < 16 || meta.height < 16 || meta.width > 8192 || meta.height > 8192) throw new AppError(415, 'Invalid stock image dimensions or format.');
    // Imports also pass the existing strict container/metadata validator before storage.
    return { bytes, filename: `${photo.provider}-${photo.providerId}.${extension}`, mime: mime! };
  } catch (error) { if (error instanceof AppError) throw error; throw new AppError(502, 'The stock image could not be validated. Search again.'); }
}
