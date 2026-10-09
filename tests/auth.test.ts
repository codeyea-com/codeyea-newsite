import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
import "dotenv/config";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { auth } from "../src/server/auth";
import { db } from "../src/server/db";
test("Better Auth processes a JSON login request without an internal error", async () => {
  const response = await auth.handler(
    new Request(process.env.BETTER_AUTH_URL + "/api/auth/sign-in/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: process.env.BETTER_AUTH_URL!,
        "x-codeyea-rate-key": "127.0.0.2",
      },
      body: JSON.stringify({
        email: "invalid@example.test",
        password: "InvalidDummyPassword123",
      }),
    }),
  );
  assert.equal(response.status, 401);
});
after(async () => db.$disconnect());

