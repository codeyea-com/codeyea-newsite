import type { Metadata } from "next";
import "./globals.css";
import "@/styles/surface.css";
import "@fontsource/josefin-sans/latin-400.css";
import "@fontsource/josefin-sans/latin-500.css";
import "@fontsource/josefin-sans/latin-600.css";
import "@/styles/tokens.css";
import { siteOrigin } from "@/content/seo";
import Script from "next/script";
import { headers } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "CODEYEA | Digital Services",
  description:
    "Website design, digital marketing, SEO and technology services for businesses worldwide.",
  creator: "CODEYEA",
  publisher: "CODEYEA",
  robots: { index: false, follow: false },
  icons: { icon: "/brand/favicon.png" },
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale =
    (await headers()).get("x-codeyea-document-language") === "ar" ? "ar" : "en";
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        <link rel="stylesheet" href="/site/page-texture.css" />
        <link rel="stylesheet" href="/site/shared-layout.css" />
        <link rel="stylesheet" href="/site/post-launch.css" />
        <link rel="stylesheet" href="/site/owner-review.css" />
        <link rel="stylesheet" href="/api/site-typography" />
        <link rel="stylesheet" href="/site/owner-batch.css?v=20261021-review3" />
        <link rel="stylesheet" href="/site/live-corrections.css?v=20261022-1" />
      </head>
      <body>
        {children}
        <Script src="/site/post-launch.js?v=20261021-review3" strategy="afterInteractive" />
        <Script src="/site/live-corrections.js?v=20261022-1" strategy="afterInteractive" />
      </body>
    </html>
  );
}
