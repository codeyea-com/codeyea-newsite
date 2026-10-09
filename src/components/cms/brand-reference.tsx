import { services, industries } from "@/schemas/content";
export function BrandReference() {
  return (
    <>
      <div className="taxonomy-grid">
        <section>
          <h2>Services</h2>
          <ul>
            {services.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Industries</h2>
          <ul>
            {industries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="tokens">
        <h2>Design tokens</h2>
        <div className="swatches">
          {[
            ["Navy", "#072448"],
            ["Cyan", "#10AABC"],
            ["Body", "#535E65"],
            ["Paper", "#FFFFFF"],
          ].map(([name, color]) => (
            <div key={name}>
              <span className="swatch" style={{ background: color }} />
              <strong>{name}</strong>
              <span className="small">{color}</span>
            </div>
          ))}
        </div>
        <p className="small">
          Supplied logo artwork is preserved. The approved brand descriptor is
          Digital Innovation Agency.
        </p>
      </section>
    </>
  );
}
