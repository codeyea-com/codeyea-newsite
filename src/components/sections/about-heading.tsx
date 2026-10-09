/** One accessible heading string; word spans are visual animation targets only. */
export function AboutHeading({ children }: { children: string }) {
  return (
    <h2 aria-label={children} data-about-reveal>
      {children.split(" ").map((word, index) => (
        <span key={index} aria-hidden="true">
          <span className="about-heading-word" data-about-stagger={index}>
            {word}
          </span>{" "}
        </span>
      ))}
    </h2>
  );
}
