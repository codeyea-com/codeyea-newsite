import { ArabicPageView, arabicMetadata } from "@/server/arabic-page-view";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return arabicMetadata((await params).slug);
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <ArabicPageView id={(await params).slug} />;
}
