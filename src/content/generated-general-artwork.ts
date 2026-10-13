import registry from './generated-general-artwork.json';
import type { AboutMedia } from '@/schemas/about';

export type GeneralArtwork = {
  src: string;
  tabletSrc?: string;
  mobileSrc?: string;
  expectedMediaId?: string;
  alt: { en: string; ar: string };
};

/** Only replace the temporary defaults; a different CMS media choice takes priority. */
export function generalArtwork(key?: string, media?: AboutMedia): GeneralArtwork | undefined {
  if (!key) return undefined;
  const art = (registry as Record<string, GeneralArtwork>)[key];
  return art && (!media || !art.expectedMediaId || media.mediaId === art.expectedMediaId) ? art : undefined;
}
