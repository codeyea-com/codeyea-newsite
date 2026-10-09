import { ZodError } from "zod";
import { AppError } from "./errors";
import { getEnv } from "./env";
import { auth } from "./auth";
export const noStore = { "Cache-Control": "no-store" };
export async function actor(request: Request) {
  return (
    (await auth.api.getSession({ headers: request.headers }))?.user ?? null
  );
}
export function sameOrigin(request: Request) {
  if (
    request.headers.get("origin") !== new URL(getEnv().BETTER_AUTH_URL).origin
  )
    throw new AppError(403, "Invalid request origin");
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new AppError(403, "Invalid request origin");
}
export async function jsonInput(request: Request, maxBytes=16384) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new AppError(415, "JSON required");
  const reader = request.body?.getReader();
  if (!reader) throw new AppError(400, "Request body required");
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new AppError(413, "Request too large");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new AppError(400, "Invalid JSON");
  }
}
export function failure(error: unknown) {
  if (error instanceof AppError)
    return Response.json(
      { error: error.message },
      { status: error.status, headers: noStore },
    );
  if (error instanceof ZodError)
    return Response.json(
      { error: "Check the required fields and allowed content limits.", issues:error.issues.map(i=>({path:i.path.join("."),message:i.message})) },
      { status: 400, headers: noStore },
    );
  console.error(
    "CMS request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return Response.json(
    { error: "Unable to complete the request." },
    { status: 500, headers: noStore },
  );
}
