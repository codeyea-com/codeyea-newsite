import { industryServiceOrder, serviceBySlug } from './service-catalog';
export const industryServiceCatalog = industryServiceOrder.map(slug => {
  const service = serviceBySlug(slug);
  return [service.title, service.ar, `/services/${service.slug}/`] as const;
});
