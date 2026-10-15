/** One public URL for each service, independent of the CMS document identifier. */
export const nestedServiceSlugs = [
  'website-design', 'brand-design', 'ecommerce', 'seo-geo', 'digital-marketing',
  'web-mobile-apps', 'ai-automation', 'technical-support',
] as const;

export function canonicalSiteHref(href: string): string {
  return href.replace(/^(https?:\/\/(?:www\.)?codeyea\.com)?(\/ar)?\/([^/?#]+)(\/?)([?#].*)?$/i,
    (original, origin = '', locale = '', slug: string, _slash, suffix = '') =>
      (nestedServiceSlugs as readonly string[]).includes(slug)
        ? `${origin}${locale}/services/${slug}/${suffix}` : original);
}

export function canonicalHtmlLinks(html: string): string {
  return html.replace(/\b(href|data-href)=(['"])([^'"]+)\2/g,
    (_all, attr, quote, href) => `${attr}=${quote}${canonicalSiteHref(href)}${quote}`);
}
