import { ArabicPageView, arabicMetadata } from "@/server/arabic-page-view";
export const dynamic = "force-dynamic";
export const generateMetadata = () => arabicMetadata("industries");
export default function Page() {
  return <ArabicPageView id="industries" />;
}
