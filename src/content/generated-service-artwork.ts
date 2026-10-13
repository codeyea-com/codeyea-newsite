import registry from './generated-service-artwork.json';

export type ServiceArtwork = {
  src: string;
  mobileSrc?: string;
  originalSource?: string;
  transparent: boolean;
  alt: { en: string; ar: string };
};

export function serviceArtwork(slug: string, slot: number | string): ServiceArtwork | undefined {
  return (registry as Record<string, Record<string, ServiceArtwork>>)[slug]?.[String(slot)];
}

const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

/** Keep the image itself in place: collage nth-child rules and motion depend on it. */
export function serviceArtworkTag(tag: string, art: ServiceArtwork, locale: string) {
  const alt = art.alt[locale === 'ar' ? 'ar' : 'en'];
  let result = tag.replace(/\bsrc=(["'])[^"']*\1/i, `src="${escape(art.src)}"`)
    .replace(/\s+(?:srcset|sizes)=(["'])[^"']*\1/gi, '')
    .replace(/\balt=(["'])[^"']*\1/i, `alt="${escape(alt)}"`);
  const attributes = ` data-generated-desktop="${escape(art.src)}"` +
    (art.mobileSrc ? ` data-generated-mobile="${escape(art.mobileSrc)}"` : '') +
    (art.transparent ? ' data-generated-open="true"' : '');
  result = result.replace(/<img\b/, '<img' + attributes);
  return result;
}
