import { industryServiceOrder, serviceBySlug } from './service-catalog';
export const industryServiceCatalog = industryServiceOrder.map(slug => {
  const service = serviceBySlug(slug);
  return [service.title, service.ar, `/${service.slug}/`] as const;
});
