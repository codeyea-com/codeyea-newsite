import type { CSSProperties } from "react";
export function ServiceWords({
  text,
  offset = 0,
}: {
  text: string;
  offset?: number;
}) {
  const words = text.split(/\s+/);
  return (
    <>
      <span className="hp-interaction-sr">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={i}>
            <span
              className="hp-service-word"
              style={
                {
                  "--word-delay": Math.min(offset + i, 18) * 12 + "ms",
                  "--word-return":
                    Math.min(words.length - i - 1, 18) * 14 + "ms",
                } as CSSProperties
              }
            >
              {word}
            </span>{" "}
          </span>
        ))}
      </span>
    </>
  );
}
