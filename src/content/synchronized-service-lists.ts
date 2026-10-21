import type { IndustryDetailContent } from '../schemas/industry-detail';
import type { ServiceItem } from '../schemas/services-page';
import { completeServiceOrder, industryServiceOrder, serviceBySlug } from './service-catalog';
import { arabicIndustryServiceCopy } from './arabic-industry-service-copy';
import { servicePageDestinationForText } from './service-destinations';

export function completeServiceItems(locale = 'en'): ServiceItem[] {
  return completeServiceOrder.map(slug => {
    const service = serviceBySlug(slug), arabic = locale === 'ar';
    return { id: service.id, title: arabic ? service.ar : service.title,
      body: arabic ? service.bodyAr : service.body, label: service.label, list: [],
      destination: `${arabic ? '/ar' : ''}/services/${slug}/`, actionLabel: arabic ? 'اكتشف الخدمة' : 'Learn More' };
  });
}

/** Complete lists share identities and labels; preserve section copy, layout and media. */
export function synchronizeIndustryServices(content: IndustryDetailContent): IndustryDetailContent {
  const arabic = content.localeId === 'ar';
  return { ...content, sections: content.sections.map(section => {
    if (section.type !== 'services') return section;
    const byPath = new Map(section.items.map(item => [
      (item.destination || servicePageDestinationForText(item.id, item.title, item.actionLabel) || '').replace(/^\/ar\//,'/').replace(/^\/services\//,'/').replace(/\/$/,''), item,
    ]));
    return { ...section, ...(arabic ? {listLabel:'كيف نساعد نشاطك',actionLabel:'خدمات متكاملة',body:arabicIndustryServiceCopy[content.slug]?.join('\n\n') ?? section.body} : {}), items: industryServiceOrder.map(slug => {
      const service = serviceBySlug(slug), saved = byPath.get('/'+slug);
      return { ...saved, id: saved?.id || `${section.id}-${slug}`,
        title: arabic ? service.ar : service.title,
        body: saved?.body || (arabic ? service.bodyAr : service.body),
        actionLabel: saved?.actionLabel || (arabic ? 'اكتشف الخدمة' : 'Learn More'),
        destination: `${arabic ? '/ar' : ''}/services/${slug}/` };
    }) };
  }) };
}
