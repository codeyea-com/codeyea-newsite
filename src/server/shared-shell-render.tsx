import { renderToReadableStream } from "react-dom/server.edge";
import { SharedHeaderView } from "@/components/sections/shared-header-view";
import { SharedFooterView } from "@/components/sections/shared-footer-view";
import { approvedNavigationView } from "@/components/sections/shared-navigation-view";
import { approvedMenuContent } from "@/content/approved-navigation";
import { resolveHomepage } from "@/content/homepage-defaults";
export async function renderSharedShell(
  shared?: unknown,
  preview = true,
  locale = "en",
) {
  const home = resolveHomepage(shared),
    content = approvedMenuContent(home.header, preview, locale),
    nav = approvedNavigationView(content);
  return {
    header: await markup(
      <SharedHeaderView
        content={content}
        navigation={nav.navigation}
        panels={nav.panels}
        homeHref={
          locale === "ar"
            ? preview
              ? "/preview/ar/"
              : "/ar/"
            : preview
              ? "/preview"
              : "/"
        }
        light
      />,
    ),
    footer: await markup(
      <SharedFooterView content={home.footer} preview={preview} />,
    ),
  };
}
async function markup(element: React.ReactNode) {
  return new Response(await renderToReadableStream(element)).text();
}
