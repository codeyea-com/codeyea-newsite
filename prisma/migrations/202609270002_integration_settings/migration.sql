CREATE TABLE "IntegrationSettings" (
  "id" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IntegrationSettings_pkey" PRIMARY KEY ("id")
);
