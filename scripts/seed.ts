import "dotenv/config";
import { db } from "../src/server/db";
const permissions = {
  view_admin: "Access CMS",
  edit_pages: "Edit and restore page drafts",
  publish_pages: "Publish pages",
  view_audit: "View editorial audit records",
  manage_users: "Manage users",
  manage_roles: "Manage roles",
  manage_settings: "Manage settings",
  edit_posts: "Edit posts",
  publish_posts: "Publish posts",
  manage_media: "Manage media",
  manage_menus: "Manage menus",
  manage_services: "Manage services",
  manage_hosting_plans: "Manage hosting plans",
  manage_portfolio: "Manage portfolio",
  manage_industries: "Manage industries",
  manage_seo: "Manage SEO",
  use_ai_assistant: "Use AI assistant",
  approve_ai_actions: "Approve AI actions",
};
for (const [id, description] of Object.entries(permissions))
  await db.permission.upsert({
    where: { id },
    update: { description },
    create: { id, description },
  });
for (const [id, name, grants] of [
  ["administrator", "Administrator", Object.keys(permissions)],
  ["editor", "Editor", ["view_admin", "edit_pages", "view_audit"]],
  ["author", "Author", ["view_admin", "edit_posts"]],
] as const) {
  await db.role.upsert({ where: { id }, update: {}, create: { id, name } });
  for (const permissionId of grants)
    await db.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: id, permissionId } },
      update: {},
      create: { roleId: id, permissionId },
    });
}
await db.locale.upsert({
  where: { id: "en" },
  update: {},
  create: { id: "en", name: "English" },
});
await db.locale.upsert({
  where: { id: "ar" },
  update: {},
  create: { id: "ar", name: "Arabic", direction: "rtl" },
});
await db.market.upsert({
  where: { id: "global" },
  update: {},
  create: { id: "global", name: "Global / US" },
});
await db.market.upsert({
  where: { id: "iq" },
  update: {},
  create: { id: "iq", name: "Iraq" },
});
const sections = [
  {
    id: "homepage-positioning",
    type: "positioning",
    heading: "CODEYEA — Digital Innovation Agency",
    body: "Your gateway to a high-level online presence that captures, converts, and launches your business.",
  },
];
await db.page.upsert({
  where: { id: "homepage" },
  update: {},
  create: {
    id: "homepage",
    slug: "/",
    title: "CODEYEA Homepage",
    localeId: "en",
    marketId: "global",
    status: "PUBLISHED",
    publishedAt: new Date(),
    publishedSnapshot: { title: "CODEYEA Homepage", sections },
    sections: {
      create: sections.map((section, position) => ({ ...section, position })),
    },
  },
});
console.log(
  "Seeded roles, permissions, locale/market mapping and homepage foundation. Existing editorial content was preserved.",
);
await db.$disconnect();
