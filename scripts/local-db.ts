import EmbeddedPostgres from "embedded-postgres";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const runtime = JSON.parse(readFileSync(".local/runtime.json", "utf8")) as {
  port: number;
  superPassword: string;
  appPassword: string;
};
const databaseDir = resolve(".local/postgres");
const pg = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: runtime.superPassword,
  port: runtime.port,
  persistent: true,
  authMethod: "scram-sha-256",
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: () => {},
});
if (!existsSync(resolve(databaseDir, "PG_VERSION"))) await pg.initialise();
await pg.start();
const client = pg.getPgClient();
await client.connect();
if (
  !(await client.query("SELECT 1 FROM pg_roles WHERE rolname='codeyea'"))
    .rowCount
) {
  if (!/^[a-f0-9]{64}$/.test(runtime.appPassword))
    throw new Error("Invalid local credential format");
  await client.query(
    `CREATE ROLE codeyea LOGIN PASSWORD '${runtime.appPassword}' NOSUPERUSER NOCREATEDB NOCREATEROLE`,
  );
}
if (
  !(await client.query("SELECT 1 FROM pg_database WHERE datname='codeyea'"))
    .rowCount
)
  await client.query("CREATE DATABASE codeyea OWNER codeyea TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C'");
await client.end();
console.log(
  `Local PostgreSQL ready on 127.0.0.1:${runtime.port}. Data persists in .local/postgres. Ctrl+C stops the server.`,
);
let closing = false;
const timer = setInterval(() => {}, 1000);
async function stop() {
  if (closing) return;
  closing = true;
  clearInterval(timer);
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
