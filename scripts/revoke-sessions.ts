import "dotenv/config";
import { db } from "../src/server/db";
const email = process.argv[2]?.trim().toLowerCase();
if (!email)
  throw new Error("Usage: npm run sessions:revoke -- user@example.com");
const user = await db.user.findUniqueOrThrow({ where: { email } });
await db.$transaction(async (tx) => {
  const result = await tx.session.deleteMany({ where: { userId: user.id } });
  await tx.auditLog.create({
    data: {
      actorKind: "OPERATOR",
      actorLabel: "Local session maintenance",
      entityType: "User",
      after: { revokedSessions: result.count },
      entityId: user.id,
      action: "auth.sessions_revoked_by_local_operator",
    },
  });
});
console.log("Sessions invalidated.");
await db.$disconnect();
