import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { db } from "../src/server/db";
import { acceptLead } from "../src/server/lead-intake";
import { deliverLead } from "../src/server/lead-delivery";
const email = `lead-test-${randomUUID()}@example.test`;
const input = {
  submissionId: randomUUID(),
  kind: "contact",
  name: "Test only",
  email,
  message: "Local storage test",
  consent: true,
};
test("saved leads are idempotent and retained when mail is not configured", async () => {
  const key = process.env.RESEND_API_KEY,
    from = process.env.RESEND_FROM;
  const originalFetch = globalThis.fetch;
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM;
  try {
    const first = await acceptLead(input);
    assert.ok(first);
    const second = await acceptLead(input);
    assert.equal(first.id, second?.id);
    await assert.rejects(() =>
      acceptLead({ ...input, email: "changed@example.test" }),
    );
    await deliverLead(first.id);
    const saved = await db.lead.findUniqueOrThrow({ where: { id: first.id } });
    assert.equal(saved.emailStatus, "WAITING_CONFIGURATION");
    assert.equal(saved.attempts, 0);
    assert.equal(
      await db.lead.count({ where: { submissionId: input.submissionId } }),
      1,
    );
    assert.equal(
      await acceptLead({
        ...input,
        submissionId: randomUUID(),
        websiteTrap: "spam",
      }),
      null,
    );
    process.env.RESEND_API_KEY = "local-mock-only";
    process.env.RESEND_FROM = "test@example.test";
    const requests: Record<string, unknown>[] = [];
    globalThis.fetch = (async (_url, options) => {
      requests.push(JSON.parse(String(options?.body)));
      assert.equal(
        new Headers(options?.headers).get("Idempotency-Key"),
        "lead/" + first.id,
      );
      return Response.json({ id: "mock-local-message" });
    }) as typeof fetch;
    await deliverLead(first.id);
    await deliverLead(first.id);
    assert.equal(requests.length, 1);
    assert.deepEqual(requests[0].to, [
      "info@codeyea.com",
      "codeyea.cda@gmail.com",
    ]);
    assert.equal(
      (await db.lead.findUniqueOrThrow({ where: { id: first.id } }))
        .emailStatus,
      "SENT",
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (key) process.env.RESEND_API_KEY = key;
    else delete process.env.RESEND_API_KEY;
    if (from) process.env.RESEND_FROM = from;
    else delete process.env.RESEND_FROM;
  }
});
after(async () => {
  await db.lead.deleteMany({ where: { email } });
  const key = createHash("sha256")
    .update(email + ":" + Math.floor(Date.now() / 3600000))
    .digest("hex");
  await db.leadThrottle.deleteMany({ where: { key } });
  await db.$disconnect();
});
