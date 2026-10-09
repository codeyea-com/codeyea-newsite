import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getEnv } from "./env";
const shared = globalThis as unknown as { codeyeaDb?: PrismaClient };
export const db =
  shared.codeyeaDb ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: getEnv().DATABASE_URL }),
  });
if (process.env.NODE_ENV !== "production") shared.codeyeaDb = db;
