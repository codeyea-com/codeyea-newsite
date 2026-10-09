import { createHash } from "node:crypto";
import { db } from "./db";
import { AppError } from "./errors";
import { leadSchema } from "@/schemas/lead";
export async function acceptLead(raw: unknown) {
  const input = leadSchema.parse(raw);
  if (input.websiteTrap) return null;
  const email = input.email.toLowerCase();
  const existing = await db.lead.findUnique({
    where: { submissionId: input.submissionId },
  });
  if (existing) {
    if (existing.email !== email || existing.kind !== input.kind)
      throw new AppError(
        409,
        "Start a new request before changing its contact details.",
      );
    return existing;
  }
  const key = createHash("sha256")
    .update(email + ":" + Math.floor(Date.now() / 3600000))
    .digest("hex");
  const limit = await db.leadThrottle.upsert({
    where: { key },
    create: { key },
    update: { count: { increment: 1 } },
  });
  if (limit.count > 5)
    throw new AppError(429, "Too many requests. Please try again later.");
  return db.lead.upsert({
    where: { submissionId: input.submissionId },
    update: {},
    create: {
      submissionId: input.submissionId,
      kind: input.kind,
      name: input.name,
      email,
      payload: input,
    },
  });
}
