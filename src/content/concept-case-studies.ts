import content from "./concept-case-studies.json";

export type CaseLocale = "en" | "ar";
export type CaseCopy = {
  name: string;
  title: string;
  intro: string;
  requirements: string[];
  services: string;
  timeline: string;
  stages: string[][];
  metrics: string[][];
  outcome: string;
};
export type ConceptCaseStudy = {
  slug: string;
  source: string;
  en: CaseCopy;
  ar: CaseCopy;
  images: { src: string; width: number; height: number }[];
};
export const conceptCaseStudies: ConceptCaseStudy[] = content;
export const conceptDisclosure = {
  en: "Concept case study. The company, project and results are fictional. All comparisons are simulated, not verified client results.",
  ar: "دراسة حالة افتراضية. الشركة والمشروع والنتائج مبتكرة؛ جميع المقارنات محاكاة وليست نتائج موثقة لعميل حقيقي.",
};
export function conceptCaseStudy(slug: string) {
  return conceptCaseStudies.find((item) => item.slug === slug);
}
