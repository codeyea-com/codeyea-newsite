import { readIntegrationSettings } from "@/server/integration-settings";
import { db } from "@/server/db";
import { actor, failure, jsonInput, noStore, sameOrigin } from "@/server/http";
import { requirePermission } from "@/server/permissions";
import { deliverLead } from "@/server/lead-delivery";
import { z } from "zod";
export async function GET(req: Request) {
  try {
    const user = await actor(req);
    await requirePermission(user?.id ?? null, "manage_settings");
    const { value: settings } = await readIntegrationSettings();
    return Response.json(
      {
        leads: await db.lead.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        proposals: await db.agentProposal.findMany({
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
        connections: [
          [
            "Resend",
            Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM),
            "Email notifications",
          ],
          [
            "GA4",
            Boolean(
              (settings.ga4PropertyId || process.env.GA4_PROPERTY_ID) &&
              process.env.GOOGLE_ACCESS_TOKEN,
            ),
            "Pages, sources, campaigns and conversions",
          ],
          [
            "GTM",
            Boolean(settings.gtmContainerId || process.env.GTM_CONTAINER_ID),
            "Tag deployment and event configuration",
          ],
          [
            "GSC",
            Boolean(
              (settings.gscSiteUrl || process.env.GSC_SITE_URL) &&
              process.env.GOOGLE_ACCESS_TOKEN,
            ),
            "Queries, pages, countries and devices",
          ],
          [
            "Microsoft Clarity",
            Boolean(
              (settings.clarityProjectId || process.env.CLARITY_PROJECT_ID) &&
              process.env.CLARITY_API_TOKEN,
            ),
            "Engagement and behaviour reports",
          ],
          [
            "Rank tracking",
            false,
            "Search Console reports can be connected later. Competitor tracking provider has not been selected.",
          ],
        ],
        agentEnabled: false,
      },
      { headers: noStore },
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const user = await actor(req);
    const input = z
      .discriminatedUnion("action", [
        z.object({ action: z.literal("retry"), id: z.string() }),
        z.object({
          action: z.literal("lead-status"),
          id: z.string(),
          status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CLOSED"]),
        }),
        z.object({
          action: z.literal("agent-proposal"),
          documentId: z.string(),
          instruction: z.string().min(10).max(5000),
        }),
      ])
      .parse(await jsonInput(req));
    if (input.action === "agent-proposal") {
      await requirePermission(user?.id ?? null, "use_ai_assistant");
      const doc = await db.siteDocument.findUniqueOrThrow({
        where: { id: input.documentId },
      });
      await db.agentProposal.create({
        data: {
          documentId: doc.id,
          instruction: input.instruction,
          baseVersion: doc.version,
          createdBy: user!.id,
          status: "WAITING_AI_CONFIGURATION",
        },
      });
    } else {
      await requirePermission(user?.id ?? null, "manage_settings");
      if (input.action === "retry") await deliverLead(input.id);
      else
        await db.lead.update({
          where: { id: input.id },
          data: { status: input.status },
        });
    }
    return Response.json({ ok: true }, { headers: noStore });
  } catch (e) {
    return failure(e);
  }
}
