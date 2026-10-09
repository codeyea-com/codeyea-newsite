CREATE TABLE "PagePublication" (
  "id" TEXT NOT NULL,
  "pageId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "previousSnapshot" JSONB,
  "previousPublishedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actorId" TEXT NOT NULL,
  CONSTRAINT "PagePublication_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PagePublication_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PagePublication_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PagePublication_pageId_version_key" ON "PagePublication"("pageId", "version");
