import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
test("test credentials cannot connect to the owner database", async () => {
  const url = new URL(process.env.DATABASE_URL!);
  url.pathname = "/codeyea";
  const client = new Client({ connectionString: url.toString() });
  try {
    await assert.rejects(
      client.connect(),
      (error: unknown) => (error as { code: string }).code === "42501",
    );
  } finally {
    await client.end();
  }
});
test("test guard rejects owner database URLs", () => {
  const previous = process.env.DATABASE_URL;
  try {
    process.env.DATABASE_URL = "postgresql://codeyea@127.0.0.1:55432/codeyea";
    assert.throws(assertTestEnvironment, /isolated/);
  } finally {
    process.env.DATABASE_URL = previous;
  }
});
