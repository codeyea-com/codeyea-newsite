import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
if (existsSync(".env") || existsSync(".local/runtime.json"))
  throw new Error(
    "Local configuration already exists; refusing to overwrite it.",
  );
mkdirSync(".local", { recursive: true });
const runtime = {
  port: 55432,
  superPassword: randomBytes(32).toString("hex"),
  appPassword: randomBytes(32).toString("hex"),
};
writeFileSync(".local/runtime.json", JSON.stringify(runtime), { mode: 0o600 });
writeFileSync(
  ".env",
  `DATABASE_URL=postgresql://codeyea:${runtime.appPassword}@127.0.0.1:${runtime.port}/codeyea\nDIRECT_URL=postgresql://codeyea:${runtime.appPassword}@127.0.0.1:${runtime.port}/codeyea\nBETTER_AUTH_URL=http://127.0.0.1:3000\nBETTER_AUTH_SECRET=${randomBytes(48).toString("hex")}\n`,
  { mode: 0o600 },
);
console.log("Created ignored local configuration. Next: npm run db:start");
