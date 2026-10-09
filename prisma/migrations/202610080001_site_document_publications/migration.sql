CREATE TABLE "SiteDocumentPublication" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "actorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SiteDocumentPublication_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SiteDocumentPublication_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SiteDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SiteDocumentPublication_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SiteDocumentPublication_documentId_version_key" ON "SiteDocumentPublication"("documentId", "version");
CREATE INDEX "SiteDocumentPublication_documentId_createdAt_idx" ON "SiteDocumentPublication"("documentId", "createdAt");
