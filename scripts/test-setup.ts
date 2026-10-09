import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { Client } from "pg";
const runtime = JSON.parse(readFileSync(".local/runtime.json", "utf8"));
if (existsSync(".env.test"))
  throw new Error(
    "Test configuration exists; refusing to overwrite credentials.",
  );
const password = randomBytes(32).toString("hex");
const client = new Client({
  host: "127.0.0.1",
  port: runtime.port,
  user: "postgres",
  password: runtime.superPassword,
  database: "postgres",
});
await client.connect();
try {
  if (
    (await client.query("SELECT 1 FROM pg_roles WHERE rolname='codeyea_test'"))
      .rowCount
  )
    throw new Error(
      "Test role exists without configuration; recover its configuration first.",
    );
  await client.query(
    `CREATE ROLE codeyea_test LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE`,
  );
  await client.query("CREATE DATABASE codeyea_test OWNER codeyea_test TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C'");
  // The test role cannot connect to the owner database, even if a test URL is accidentally changed.
  await client.query("REVOKE CONNECT ON DATABASE codeyea FROM PUBLIC");
  await client.query("GRANT CONNECT ON DATABASE codeyea TO codeyea");
  writeFileSync(
    ".env.test",
    `CODEYEA_ENV=test\nDATABASE_URL=postgresql://codeyea_test:${password}@127.0.0.1:${runtime.port}/codeyea_test\nDIRECT_URL=postgresql://codeyea_test:${password}@127.0.0.1:${runtime.port}/codeyea_test\nBETTER_AUTH_URL=http://127.0.0.1:3001\nBETTER_AUTH_SECRET=${randomBytes(48).toString("hex")}\n`,
    { mode: 0o600 },
  );
  console.log(
    "Isolated test database and credentials created. Run npm test and npm run test:e2e.",
  );
} finally {
  await client.end();
}
