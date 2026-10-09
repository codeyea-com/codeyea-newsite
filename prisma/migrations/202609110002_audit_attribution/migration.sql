ALTER TABLE "AuditLog" ALTER COLUMN "actorId" DROP NOT NULL;
ALTER TABLE "AuditLog" ADD COLUMN "actorKind" TEXT NOT NULL DEFAULT 'USER', ADD COLUMN "actorLabel" TEXT, ADD COLUMN "entityType" TEXT NOT NULL DEFAULT 'Page';
UPDATE "AuditLog" SET "entityType"='User' WHERE "action" LIKE 'auth.%' OR "action" LIKE 'user.%';
UPDATE "AuditLog" SET "actorId"=NULL, "actorKind"='OPERATOR', "actorLabel"='Local operator (legacy attribution corrected)' WHERE "action" IN ('user.bootstrapped','auth.sessions_revoked_by_local_operator');
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actor_identity_check" CHECK (("actorKind"='USER' AND "actorId" IS NOT NULL) OR ("actorKind" IN ('OPERATOR','SYSTEM') AND "actorId" IS NULL AND "actorLabel" IS NOT NULL));
