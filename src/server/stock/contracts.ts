import { z } from 'zod';

export const searchInput = z.object({
  query: z.string().trim().min(2).max(100).regex(/^[^\u0000-\u001f\u007f]+$/),
  provider: z.enum(['all', 'pexels', 'pixabay']).default('all'),
  orientation: z.enum(['landscape', 'portrait', 'square']).default('landscape'),
  page: z.coerce.number().int().min(1).max(25).default(1),
}).strict();
export type SearchInput = z.infer<typeof searchInput>;
export type Provider = 'pexels' | 'pixabay';
// These server records never cross the HTTP boundary. Preview/download URLs stay private.
export type StockPhoto = {
  provider: Provider; providerId: string; sourcePageUrl: string;
  contributor: string; contributorUrl: string | null;
  width: number; height: number; alt: string; licenseLabel: string;
  previewUrl: string; downloadUrl: string;
};
export type SearchPage = { photos: StockPhoto[]; hasMore: boolean };
export type StockAdapter = (input: SearchInput, fetcher?: typeof fetch) => Promise<SearchPage>;
