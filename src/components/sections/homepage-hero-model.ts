export type HeroServiceItem = {
  id?: unknown;
  title?: unknown;
  body?: unknown;
  enabled?: unknown;
  position?: unknown;
};

export type HeroServiceSlide = {
  id: string;
  title: string;
  body: string;
};

export function createHeroServiceSlides(items: HeroServiceItem[]): HeroServiceSlide[] {
  return items
    .filter((item) => item.enabled !== false)
    .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
    .map((item) => ({
      id: String(item.id ?? ""),
      title: String(item.title ?? ""),
      body: String(item.body ?? ""),
    }))
    .filter((item) => item.id && item.title);
}

export function adjacentHeroIndex(index: number, direction: -1 | 1, length: number) {
  if (length <= 1) return 0;
  return (index + direction + length) % length;
}
