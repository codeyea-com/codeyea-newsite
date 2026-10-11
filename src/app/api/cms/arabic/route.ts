import { actor, failure, noStore, sameOrigin } from "@/server/http";
import { initializeArabicPages } from "@/server/arabic-initialize";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await actor(request);
    return Response.json(await initializeArabicPages(user?.id ?? null), {
      headers: noStore,
    });
  } catch (error) {
    return failure(error);
  }
}
