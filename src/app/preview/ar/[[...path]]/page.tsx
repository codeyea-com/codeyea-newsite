import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { requirePermission } from "@/server/permissions";
import { ArabicPageView } from "@/server/arabic-page-view";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private Arabic draft",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  await requirePermission(session.user.id, "view_admin");
  const path = (await params).path ?? [];
  const id = !path.length
    ? "homepage"
    : path[0] === "industries" && path.length === 2
      ? path[1]
      : path.length === 1
        ? path[0]
        : "";
  return <ArabicPageView id={id} preview />;
}
