import { failure, jsonInput, sameOrigin, noStore } from "@/server/http";
import { acceptLead } from "@/server/lead-intake";
import { deliverLead } from "@/server/lead-delivery";
import { AppError } from "@/server/errors";
import { turnstilePublicConfig, verifyTurnstile } from "@/server/turnstile";

export function GET() {
  return Response.json(turnstilePublicConfig(), { headers: noStore });
}

export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const input = await jsonInput(req, 40000);
    if (!input || typeof input !== "object" || Array.isArray(input))
      throw new AppError(400, "A valid lead request is required.");
    const { turnstileToken, ...payload } = input as Record<string, unknown>;
    await verifyTurnstile(turnstileToken);
    const lead = await acceptLead(payload);
    if (lead) await deliverLead(lead.id);
    return Response.json({ ok: true }, { headers: noStore });
  } catch (e) {
    return failure(e);
  }
}
