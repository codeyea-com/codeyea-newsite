import { contextualLink } from "@/content/contextual-links";
export function ContextualCopy({ text }: { text: string }) {
  const link = contextualLink(text);
  return link ? (
    <>
      {link.before}
      <a className="cy-context-link" href={link.href}>
        {link.label}
      </a>
      {link.after}
    </>
  ) : (
    <>{text}</>
  );
}
