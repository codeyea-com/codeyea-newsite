// Register a path only when its real detail page is implemented. CMS entries alone
// cannot activate a missing route. Both heading and CTA use this same resolver.
const implementedIndustryPaths:ReadonlySet<string>=new Set();
export function industryDestination(destination:string,availablePaths:ReadonlySet<string>=implementedIndustryPaths){return availablePaths.has(destination)?destination:undefined;}
