export type Section = {
  id: string;
  type: string;
  heading: string;
  body: string;
};
export type Page = {
  id: string;
  title: string;
  version: number;
  sections: Section[];
  homepage?: import("@/schemas/homepage-editor").HomepageContent;
  about?: import("@/schemas/about").AboutContent;
  industriesPage?: import("@/schemas/industries-page").IndustriesContent;
  industryDetail?: import("@/schemas/industry-detail").IndustryDetailContent;
  servicesPage?: import("@/schemas/services-page").ServicesContent;
  publishedSnapshot: unknown;
  publishedAt: string | null;
  hasUnpublishedChanges: boolean;
};
export type Revision = {
  id: string;
  version: number;
  createdAt: string;
  reason: string;
  snapshot: {
    servicesPage?: import("@/schemas/services-page").ServicesContent;
    title: string;
    sections: Section[];
    homepage?: import("@/schemas/homepage-editor").HomepageContent;
    about?: import("@/schemas/about").AboutContent;
  industriesPage?: import("@/schemas/industries-page").IndustriesContent;
  industryDetail?: import("@/schemas/industry-detail").IndustryDetailContent;
  };
};
export type Audit = {
  id: string;
  action: string;
  createdAt: string;
  actor: { name: string } | null;
  entityId: string;
  entityType: string;
  actorId: string | null;
  actorKind: "USER" | "OPERATOR" | "SYSTEM";
  actorLabel: string | null;
  before: unknown;
  after: unknown;
};
export type Data = {
  approvedProjects?: { id: string; title: string }[];
  user: { name: string; email: string };
  permissions: string[];
  page: Page;
  revisions: Revision[];
  nextRevisionVersion: number | null;
  audit: Audit[];
};
