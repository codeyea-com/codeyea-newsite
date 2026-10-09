import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../src/server/db";
import {
  integrationSettingsSchema,
  emptyIntegrationSettings,
} from "../src/schemas/integrations";
import {
  readIntegrationSettings,
  saveIntegrationSettings,
} from "../src/server/integration-settings";
const suffix = randomUUID(),
  user = "settings-user-" + suffix,
  role = "settings-role-" + suffix;
let original: Awaited<ReturnType<typeof db.integrationSettings.findUnique>>;
before(async () => {
  original = await db.integrationSettings.findUnique({ where: { id: "site" } });
  await db.role.create({
    data: {
      id: role,
      name: role,
      permissions: { create: { permissionId: "manage_settings" } },
    },
  });
  await db.user.create({
    data: {
      id: user,
      email: user + "@example.test",
      name: "Test settings editor",
      roles: { create: { roleId: role } },
    },
  });
});
test("installation snippets are reduced to identifiers, not executable script", () => {
  const value = integrationSettingsSchema.parse({
    ...emptyIntegrationSettings,
    ga4MeasurementId:
      '<script src="https://www.googletagmanager.com/gtag/js?id=G-EXAMPLE123"></script>',
    gtmContainerId: "gtm('GTM-EXAMPLE')",
    gscVerification:
      '<meta name="google-site-verification" content="token_123-example">',
    clarityProjectId: "https://www.clarity.ms/tag/abc123def",
  });
  assert.equal(value.ga4MeasurementId, "G-EXAMPLE123");
  assert.equal(value.gtmContainerId, "GTM-EXAMPLE");
  assert.equal(value.clarityProjectId, "abc123def");
  assert.equal(value.gscVerification, "token_123-example");
  assert.equal(value.trackingEnabled, false);
  assert.equal(
    integrationSettingsSchema.safeParse({
      ...emptyIntegrationSettings,
      ga4MeasurementId: "<script>alert(1)</script>",
    }).success,
    false,
  );
  assert.equal(
    integrationSettingsSchema.safeParse({
      ...emptyIntegrationSettings,
      gscSiteUrl: "javascript:alert(1)",
    }).success,
    false,
  );
});
test("platform settings require permissions and reject stale saves without losing configuration", async () => {
  const initial = await readIntegrationSettings();
  await assert.rejects(() =>
    saveIntegrationSettings(null, initial.version, emptyIntegrationSettings),
  );
  const saved = await saveIntegrationSettings(user, initial.version, {
    ...emptyIntegrationSettings,
    ga4PropertyId: "123456",
  });
  assert.equal(saved.version, initial.version + 1);
  assert.equal((await readIntegrationSettings()).value.ga4PropertyId, "123456");
  await assert.rejects(() =>
    saveIntegrationSettings(user, initial.version, emptyIntegrationSettings),
  );
  assert.equal((await readIntegrationSettings()).value.ga4PropertyId, "123456");
});
after(async () => {
  if (original)
    await db.integrationSettings.update({
      where: { id: "site" },
      data: {
        value: JSON.parse(JSON.stringify(original.value)),
        version: original.version,
      },
    });
  else await db.integrationSettings.deleteMany({ where: { id: "site" } });
  await db.auditLog.deleteMany({ where: { actorId: user } });
  await db.user.deleteMany({ where: { id: user } });
  await db.rolePermission.deleteMany({ where: { roleId: role } });
  await db.role.deleteMany({ where: { id: role } });
  await db.$disconnect();
});
