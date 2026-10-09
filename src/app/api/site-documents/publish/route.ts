import { actor, failure, jsonInput, noStore, sameOrigin } from "@/server/http";
import { publishSiteDocument } from "@/server/site-editing";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await actor(request);
    const input = z.object({ id: z.string().min(1).max(100), version: z.number().int().positive(), action: z.enum(["publish", "unpublish"]) }).strict().parse(await jsonInput(request));
    const { action, ...documentInput } = input;
    return Response.json(await publishSiteDocument(user?.id ?? null, documentInput, action), { headers: noStore });
  } catch (error) { return failure(error); }
}
