import { NextResponse, type NextRequest } from "next/server";
/** Derive document language from the route, never a caller-supplied header. */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const arabic = /^\/(?:ar|preview\/ar)(?:\/|$)/.test(request.nextUrl.pathname);
  headers.set("x-codeyea-document-language", arabic ? "ar" : "en");
  return NextResponse.next({ request: { headers } });
}
export const config = {
  matcher: ["/((?!api|_next|asset|brand|homepage|site|.*\\.[^/]+$).*)"],
};
