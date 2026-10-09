import "dotenv/config";
import { defineConfig } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // `prisma generate` does not connect to a database, so it must still run in
  // build environments that keep DATABASE_URL server-only and unavailable at
  // build time. Database commands still require a real URL to connect.
  datasource: { url: process.env.DIRECT_URL || process.env.DATABASE_URL || "" },
});
