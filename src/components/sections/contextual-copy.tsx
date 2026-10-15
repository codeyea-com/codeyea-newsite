import { contextualLinks } from "@/content/contextual-links";
export function ContextualCopy({ text }: { text: string }) {
  return <>{contextualLinks(text).map((part, index) => part.href
    ? <a key={index} className="cy-context-link" href={part.href}>{part.text}</a>
    : part.text)}</>;
}
