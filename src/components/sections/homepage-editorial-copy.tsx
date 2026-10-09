/** Plain-text CMS copy: blank lines separate paragraphs; hyphen lines form lists. */
export function EditorialCopy({ text }: { text: string }) {
  return <div className="hp-editorial-copy">{text.split(/\n\s*\n/).filter(Boolean).map((block, index) => {
    const lines = block.split('\n');
    return lines.every(line => /^-\s+/.test(line))
      ? <ul key={index}>{lines.map((line, i) => <li key={i}>{line.replace(/^-\s+/, '')}</li>)}</ul>
      : <p key={index}>{block}</p>;
  })}</div>;
}
