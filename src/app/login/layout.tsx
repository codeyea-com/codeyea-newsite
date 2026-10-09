import "@/styles/studio.css";
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="studio-surface">{children}</div>;
}
