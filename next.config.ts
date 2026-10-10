import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: { "/*": ["./site-templates/**/*", "./src/styles/homepage-header-final.css", "./src/styles/approved-mega.css", "./src/styles/homepage-footer.css"] },
  skipTrailingSlashRedirect: true,
  distDir: process.env.CODEYEA_NEXT_DIST_DIR || (process.env.CODEYEA_ENV === "test" ? ".next-test" : ".next"),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://*.challenges.cloudflare.com" +
              (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "") +
              "; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com https://*.challenges.cloudflare.com; frame-src https://challenges.cloudflare.com https://*.challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
        ],
      },
      {source:'/preview/:path*',headers:[{key:'X-Frame-Options',value:'SAMEORIGIN'},{key:'Cache-Control',value:'private, no-store'},{key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://*.challenges.cloudflare.com"+(process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "")+"; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://codeyea.com; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com https://*.challenges.cloudflare.com; frame-src https://challenges.cloudflare.com https://*.challenges.cloudflare.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"}]},
    ];
  },
};
export default config;
