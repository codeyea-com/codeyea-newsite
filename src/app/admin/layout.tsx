import "@/styles/studio.css";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { permissionsFor } from "@/server/permissions";
export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const permissions = await permissionsFor(session.user.id);
  if (!permissions.includes("view_admin"))
    return (
      <main>Access to website management is not enabled for this account.</main>
    );
  return <div className="studio-surface">{children}</div>;
}
