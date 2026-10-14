import { caseStudyResponse } from "@/server/public-case-study";

export const dynamic = "force-dynamic";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  return caseStudyResponse((await params).slug ?? [], "ar");
}
