import type { Metadata } from "next";
import "./globals.css";
import "@/styles/surface.css";
import "@fontsource/josefin-sans/latin-400.css";
import "@fontsource/josefin-sans/latin-500.css";
import "@fontsource/josefin-sans/latin-600.css";
import "@/styles/tokens.css";
import {siteOrigin} from "@/content/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "CODEYEA | Digital Services",
  description: "Website design, digital marketing, SEO and technology services for businesses worldwide.",
  creator: "CODEYEA",
  publisher: "CODEYEA",
  robots: { index: false, follow: false },
  icons: { icon: "/brand/favicon.png" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
