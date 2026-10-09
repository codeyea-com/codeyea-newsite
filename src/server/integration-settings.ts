import { db } from "./db";
import { requirePermission } from "./permissions";
import { AppError } from "./errors";
import {
  integrationSettingsSchema,
  emptyIntegrationSettings,
} from "@/schemas/integrations";
export async function readIntegrationSettings() {
  const row = await db.integrationSettings.findUnique({
    where: { id: "site" },
  });
  return {
    version: row?.version ?? 0,
    value: row
      ? integrationSettingsSchema.parse(row.value)
      : emptyIntegrationSettings,
  };
}
export async function saveIntegrationSettings(
  actorId: string | null,
  version: number,
  raw: unknown,
) {
  const value = integrationSettingsSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await requirePermission(actorId, "manage_settings", tx);
    const row = await tx.integrationSettings.findUnique({
      where: { id: "site" },
    });
    if ((row?.version ?? 0) !== version)
      throw new AppError(409, "Settings changed. Reload before saving.");
    if (row) {
      const saved = await tx.integrationSettings.updateMany({
        where: { id: "site", version },
        data: { value, version: { increment: 1 } },
      });
      if (!saved.count)
        throw new AppError(409, "Settings changed. Reload before saving.");
    } else await tx.integrationSettings.create({ data: { id: "site", value } });
    await tx.auditLog.create({
      data: {
        actorId: actorId!,
        entityType: "IntegrationSettings",
        entityId: "site",
        action: "settings.saved",
      },
    });
    return { version: version + 1, value };
  });
}
