import { z } from "zod";
import { cmsPageIds } from "@/content/industry-registry";
import { aiProposalRequestSchema } from "@/schemas/ai-assistant";
import { actor, failure, jsonInput, noStore, sameOrigin } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import { createPageProposal, recordProposalAction } from "@/server/ai/proposal";

export async function GET(request: Request) {
  try {
    const user = await actor(request);
    await requirePermission(user?.id ?? null, "use_ai_assistant");
    return Response.json({ configured: Boolean(process.env.AI_API_KEY?.trim() && process.env.AI_MODEL?.trim()) }, { headers: noStore });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await actor(request);
    await requirePermission(user?.id ?? null, "use_ai_assistant");
    const input = aiProposalRequestSchema.parse(await jsonInput(request, 262144));
    if (!(cmsPageIds as readonly string[]).includes(input.pageId)) return Response.json({ error: "Page not found." }, { status: 404, headers: noStore });
    return Response.json(await createPageProposal(user!.id, input), { headers: noStore });
  } catch (error) { return failure(error); }
}

export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const user = await actor(request);
    await requirePermission(user?.id ?? null, "use_ai_assistant");
    const input = z.object({ proposalId: z.string().min(1).max(80), action: z.enum(["applied", "discarded"]) }).strict().parse(await jsonInput(request));
    return Response.json(await recordProposalAction(user!.id, input.proposalId, input.action), { headers: noStore });
  } catch (error) { return failure(error); }
}
