import { actor, failure, jsonInput, noStore, sameOrigin } from "@/server/http";
import { publishDraft } from "@/server/publishing";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await actor(request);
    return Response.json(
      await publishDraft(user?.id ?? null, await jsonInput(request)),
      { headers: noStore },
    );
  } catch (error) {
    return failure(error);
  }
}
