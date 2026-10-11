import { ArabicPageView, arabicMetadata } from "@/server/arabic-page-view";
export const dynamic = "force-dynamic";
export const generateMetadata = () => arabicMetadata("about");
export default function Page() {
  return <ArabicPageView id="about" />;
}
