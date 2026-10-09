import { z } from "zod";
import { actor, failure, jsonInput, noStore, sameOrigin } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import {
  readIntegrationSettings,
  saveIntegrationSettings,
} from "@/server/integration-settings";
export async function GET(req: Request) {
  try {
    const user = await actor(req);
    await requirePermission(user?.id ?? null, "manage_settings");
    return Response.json(await readIntegrationSettings(), { headers: noStore });
  } catch (e) {
    return failure(e);
  }
}
export async function PUT(req: Request) {
  try {
    sameOrigin(req);
    const user = await actor(req);
    const input = z
      .object({ version: z.number().int().nonnegative(), value: z.unknown() })
      .parse(await jsonInput(req, 40000));
    return Response.json(
      await saveIntegrationSettings(
        user?.id ?? null,
        input.version,
        input.value,
      ),
      { headers: noStore },
    );
  } catch (e) {
    return failure(e);
  }
}
