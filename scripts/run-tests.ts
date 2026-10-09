import { spawnSync } from "node:child_process";
import { loadTestEnvironment } from "./test-environment";
import { Client } from "pg";
loadTestEnvironment();
function run(args: string[]) {
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run(["node_modules/prisma/build/index.js", "migrate", "deploy"]);
run(["--import", "tsx", "scripts/seed.ts"]);
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query('DELETE FROM "RateLimit"');
} finally {
  await client.end();
}
if (process.argv[2] === "browser") {
  run(["node_modules/next/dist/bin/next", "build"]);
  run(["node_modules/@playwright/test/cli.js", "test"]);
} else
  run(["--import", "tsx", "--test", "--test-concurrency=1", "tests/*.test.ts"]);
