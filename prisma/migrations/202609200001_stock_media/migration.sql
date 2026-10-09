ALTER TABLE "MediaAsset" ADD COLUMN "source" JSONB,
 ADD COLUMN "fileHash" TEXT, ADD COLUMN "stockIdentity" TEXT;
CREATE UNIQUE INDEX "MediaAsset_fileHash_key" ON "MediaAsset"("fileHash");
CREATE UNIQUE INDEX "MediaAsset_stockIdentity_key" ON "MediaAsset"("stockIdentity");
CREATE TABLE "StockSearchCache" (
 "id" TEXT NOT NULL PRIMARY KEY, "response" JSONB NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "StockSearchCache_expiresAt_idx" ON "StockSearchCache"("expiresAt");
