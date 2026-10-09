import { z } from 'zod';
import { AppError } from '../errors';
import { providerJson, providerUrl } from './transport';
import type { StockAdapter } from './contracts';

const responseSchema = z.object({ totalHits: z.number().int().nonnegative(), hits: z.array(z.object({
  id: z.number().int().positive(), imageWidth: z.number().int().positive(), imageHeight: z.number().int().positive(),
  pageURL: z.string(), user: z.string().max(300), user_id: z.number().int().nonnegative(), tags: z.string().max(2000),
  webformatURL: z.string(), largeImageURL: z.string(),
})).max(200) });

export const searchPixabay: StockAdapter = async (input, fetcher) => {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) throw new AppError(503, 'PIXABAY_API_KEY unavailable');
  const url = new URL('https://pixabay.com/api/');
  url.search = new URLSearchParams({ key, q: input.query, lang: 'en', image_type: 'photo', safesearch: 'true',
    orientation: input.orientation === 'landscape' ? 'horizontal' : input.orientation === 'portrait' ? 'vertical' : 'all',
    page: String(input.page), per_page: '20' }).toString();
  try {
    const data = responseSchema.parse(await providerJson(url, {}, fetcher));
    const hits = input.orientation === 'square' ? data.hits.filter(p => p.imageWidth / p.imageHeight >= 0.9 && p.imageWidth / p.imageHeight <= 1.1) : data.hits;
    return { hasMore: input.page * 20 < Math.min(500, data.totalHits), photos: hits.map(p => ({
      provider: 'pixabay' as const, providerId: String(p.id), width: p.imageWidth, height: p.imageHeight,
      sourcePageUrl: providerUrl(p.pageURL, ['pixabay.com', 'www.pixabay.com']), contributor: p.user,
      contributorUrl: `https://pixabay.com/users/${encodeURIComponent(p.user)}-${p.user_id}/`, alt: p.tags.slice(0, 300),
      licenseLabel: 'Pixabay Content License — temporary stock, owner approval pending',
      previewUrl: providerUrl(p.webformatURL, ['pixabay.com', 'cdn.pixabay.com']),
      downloadUrl: providerUrl(p.largeImageURL, ['pixabay.com', 'cdn.pixabay.com']),
    })) };
  } catch (error) { if (error instanceof AppError) throw error; throw new AppError(502, 'Pixabay returned an invalid response.'); }
};
