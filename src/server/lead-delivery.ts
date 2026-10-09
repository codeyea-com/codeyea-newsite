import { db } from "./db";
import { AppError } from "./errors";
import { buildLeadEmailPayload } from "./lead-email";

export async function deliverLead(id: string) {
  const lead = await db.lead.findUniqueOrThrow({ where: { id } });
  if (lead.kind !== "contact" && lead.kind !== "quote")
    throw new AppError(500, "Unsupported lead type");
  if (lead.emailStatus === "SENT") return;
  const key = process.env.RESEND_API_KEY,
    from = process.env.RESEND_FROM;
  if (!key || !from) {
    await db.lead.updateMany({
      where: { id, emailStatus: { not: "SENT" } },
      data: {
        emailStatus: "WAITING_CONFIGURATION",
        emailError: "Configure RESEND_API_KEY and verified RESEND_FROM",
      },
    });
    return;
  }
  // Resend only retains idempotency keys for 24 hours. Do not blindly resend
  // an old uncertain attempt after its deduplication window has expired.
  if (
    lead.attempts > 0 &&
    Date.now() - lead.createdAt.getTime() > 23 * 60 * 60 * 1000
  ) {
    await db.lead.updateMany({
      where: { id, emailStatus: { not: "SENT" } },
      data: {
        emailStatus: "NEEDS_REVIEW",
        emailError:
          "Check the provider delivery log before retrying this older request.",
      },
    });
    throw new AppError(
      409,
      "Check the Resend delivery log for this older request before sending again.",
    );
  }
  const claim = await db.lead.updateMany({
    where: {
      id,
      OR: [
        { emailStatus: { in: ["PENDING", "FAILED", "WAITING_CONFIGURATION"] } },
        {
          emailStatus: "SENDING",
          updatedAt: { lt: new Date(Date.now() - 120000) },
        },
      ],
    },
    data: { emailStatus: "SENDING", attempts: { increment: 1 } },
  });
  if (!claim.count) return;
  try {
    const requestBody = await buildLeadEmailPayload(
      { ...lead, kind: lead.kind as "contact" | "quote" },
      from,
    );
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        "Idempotency-Key": "lead/" + id,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw Error("Email provider rejected the request");
    const result = await response.json();
    if (typeof result.id !== "string")
      throw Error("Missing provider confirmation");
    await db.lead.update({
      where: { id },
      data: { emailStatus: "SENT", providerId: result.id, emailError: null },
    });
  } catch {
    await db.lead.updateMany({
      where: { id, emailStatus: "SENDING" },
      data: {
        emailStatus: "FAILED",
        emailError:
          "Email delivery could not be confirmed. Retry from Leads within the provider deduplication window.",
      },
    });
  }
}
