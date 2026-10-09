import { auth } from "@/server/auth";
import { sameOrigin, failure, jsonInput } from "@/server/http";
// A shared, server-set bucket prevents spoofed forwarding headers bypassing local auth limits.
async function boundedRequest(request: Request) {
  const headers = new Headers(request.headers);
  headers.set("x-codeyea-rate-key", "127.0.0.1");
  // Next wraps Request in a proxy. Cloning that proxy breaks Node's private Request state.
  // Reconstruct from primitives and a size-bounded JSON body instead.
  const body =
    request.method === "POST"
      ? JSON.stringify(await jsonInput(request))
      : undefined;
  return new Request(request.url, { method: request.method, headers, body });
}
export async function GET(request: Request) {
  try {
    return await auth.handler(await boundedRequest(request));
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    return await auth.handler(await boundedRequest(request));
  } catch (error) {
    return failure(error);
  }
}
