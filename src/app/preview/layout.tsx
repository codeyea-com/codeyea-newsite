import { PreviewQuote } from "@/components/cms/preview-quote";
export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PreviewQuote />
    </>
  );
}
