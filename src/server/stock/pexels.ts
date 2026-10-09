import { z } from 'zod';
import { AppError } from '../errors';
import { providerJson, providerUrl } from './transport';
import type { StockAdapter } from './contracts';

const responseSchema = z.object({ total_results: z.number().int().nonnegative(), photos: z.array(z.object({
  id: z.number().int().positive(), width: z.number().int().positive(), height: z.number().int().positive(),
  url: z.string(), photographer: z.string().max(300), photographer_url: z.string(), alt: z.string().max(2000).optional(),
  src: z.object({ medium: z.string(), large2x: z.string() }),
})).max(80) });

export const searchPexels: StockAdapter = async (input, fetcher) => {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new AppError(503, 'PEXELS_API_KEY unavailable');
  const url = new URL('https://api.pexels.com/v1/search');
  url.search = new URLSearchParams({ query: input.query, orientation: input.orientation, page: String(input.page), per_page: '20' }).toString();
  try {
    const data = responseSchema.parse(await providerJson(url, { Authorization: key }, fetcher));
    return { hasMore: input.page * 20 < data.total_results, photos: data.photos.map(p => ({
      provider: 'pexels' as const, providerId: String(p.id), width: p.width, height: p.height,
      sourcePageUrl: providerUrl(p.url, ['www.pexels.com', 'pexels.com']), contributor: p.photographer,
      contributorUrl: providerUrl(p.photographer_url, ['www.pexels.com', 'pexels.com']), alt: (p.alt ?? '').slice(0, 300),
      licenseLabel: 'Pexels License — temporary stock, owner approval pending',
      previewUrl: providerUrl(p.src.medium, ['images.pexels.com']), downloadUrl: providerUrl(p.src.large2x, ['images.pexels.com']),
    })) };
  } catch (error) { if (error instanceof AppError) throw error; throw new AppError(502, 'Pexels returned an invalid response.'); }
};
