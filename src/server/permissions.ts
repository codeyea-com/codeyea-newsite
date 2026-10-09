import { db } from "./db";
import type { Prisma } from "../generated/prisma/client";
import { AppError } from "./errors";
export async function permissionsFor(
  actorId: string | null,
  client: Prisma.TransactionClient = db,
) {
  if (!actorId) throw new AppError(401, "Unauthorized");
  const user = await client.user.findUnique({
    where: { id: actorId },
    include: {
      roles: { include: { role: { include: { permissions: true } } } },
    },
  });
  if (!user) throw new AppError(401, "Unauthorized");
  return [
    ...new Set(
      user.roles.flatMap((r) => r.role.permissions.map((p) => p.permissionId)),
    ),
  ];
}
export async function requirePermission(
  actorId: string | null,
  permission: string,
  client: Prisma.TransactionClient = db,
) {
  const grants = await permissionsFor(actorId, client);
  if (!grants.includes(permission)) throw new AppError(403, "Forbidden");
  return grants;
}
