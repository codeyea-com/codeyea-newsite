CREATE TABLE "MediaAsset" (
 "id" TEXT PRIMARY KEY,"filename" TEXT NOT NULL,"mimeType" TEXT NOT NULL,"width" INTEGER NOT NULL,"height" INTEGER NOT NULL,"size" INTEGER NOT NULL,
 "alt" TEXT NOT NULL DEFAULT '',"focalX" INTEGER NOT NULL DEFAULT 50,"focalY" INTEGER NOT NULL DEFAULT 50,"variants" JSONB NOT NULL,
 "state" TEXT NOT NULL DEFAULT 'PENDING',"version" INTEGER NOT NULL DEFAULT 1,"archivedAt" TIMESTAMP(3),"creatorId" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "MediaAsset_creator_fkey" FOREIGN KEY("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT,
 CONSTRAINT "MediaAsset_bounds" CHECK ("width">=16 AND "height">=16 AND "size">0 AND "focalX" BETWEEN 0 AND 100 AND "focalY" BETWEEN 0 AND 100 AND "state" IN ('PENDING','READY','CLEANUP'))
);
CREATE INDEX "MediaAsset_state_archivedAt_createdAt_idx" ON "MediaAsset"("state","archivedAt","createdAt");
CREATE TABLE "MediaUploadQuota" ("actorId" TEXT PRIMARY KEY,"windowStart" TIMESTAMP(3) NOT NULL,"count" INTEGER NOT NULL);
