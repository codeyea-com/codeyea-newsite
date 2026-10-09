import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { verifyTurnstile } from "../src/server/turnstile";
const env = process.env as Record<string, string | undefined>;

const saved = {
  nodeEnv: env.NODE_ENV,
  siteKey: process.env.TURNSTILE_SITE_KEY,
  secret: process.env.TURNSTILE_SECRET_KEY,
  authUrl: process.env.BETTER_AUTH_URL,
  fetch: globalThis.fetch,
};

afterEach(() => {
  env.NODE_ENV = saved.nodeEnv;
  process.env.TURNSTILE_SITE_KEY = saved.siteKey;
  process.env.TURNSTILE_SECRET_KEY = saved.secret;
  process.env.BETTER_AUTH_URL = saved.authUrl;
  globalThis.fetch = saved.fetch;
});

test("production lead verification fails closed when Turnstile keys are missing", async () => {
  env.NODE_ENV = "production";
  delete process.env.TURNSTILE_SITE_KEY;
  delete process.env.TURNSTILE_SECRET_KEY;
  await assert.rejects(verifyTurnstile("token"), (error: { status?: number }) => error.status === 503);
});

test("Turnstile sends the secret only to Siteverify and checks host and action", async () => {
  env.NODE_ENV = "production";
  process.env.TURNSTILE_SITE_KEY = "public-site-key";
  process.env.TURNSTILE_SECRET_KEY = "server-only-secret";
  process.env.BETTER_AUTH_URL = "https://codeyea.com";
  let requestBody = "";
  globalThis.fetch = async (input, init) => {
    assert.equal(input, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    requestBody = String(init?.body);
    return Response.json({ success: true, hostname: "codeyea.com", action: "lead" });
  };

  await verifyTurnstile("single-use-token");
  const values = new URLSearchParams(requestBody);
  assert.equal(values.get("secret"), "server-only-secret");
  assert.equal(values.get("response"), "single-use-token");
  assert.ok(values.get("idempotency_key"));
});

test("Turnstile rejects missing and mismatched tokens without saving a lead", async () => {
  env.NODE_ENV = "production";
  process.env.TURNSTILE_SITE_KEY = "public-site-key";
  process.env.TURNSTILE_SECRET_KEY = "server-only-secret";
  process.env.BETTER_AUTH_URL = "https://codeyea.com";
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    return Response.json({ success: true, hostname: "attacker.example", action: "lead" });
  };

  await assert.rejects(verifyTurnstile(""), (error: { status?: number }) => error.status === 400);
  await assert.rejects(verifyTurnstile("forged-token"), (error: { status?: number }) => error.status === 400);
  assert.equal(requests, 1);
});
