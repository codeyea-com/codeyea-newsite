import { industrySlugs } from './industry-registry';
// Each registered industry has a real bilingual detail template.
const implementedIndustryPaths:ReadonlySet<string>=new Set(industrySlugs.flatMap(slug=>[
 `/industries/${slug}/`, `/ar/industries/${slug}/`,
]));
export function industryDestination(destination:string,availablePaths:ReadonlySet<string>=implementedIndustryPaths){return implementedIndustryPaths.has(destination)||availablePaths.has(destination)?destination:undefined;}
