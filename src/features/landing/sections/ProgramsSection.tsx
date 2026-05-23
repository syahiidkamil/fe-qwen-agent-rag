import type { LandingConfig } from "@/types/config";

interface ProgramsSectionProps {
  config: LandingConfig;
}

export function ProgramsSection({ config }: ProgramsSectionProps) {
  const s = config.section1;
  return (
    <section
      className="land-section"
      id={s.eyebrow.toLowerCase().replace(/\s+/g, "-")}
    >
      <div className="land-section-inner">
        <div className="land-section-head">
          <span className="eyebrow">{s.eyebrow}</span>
          <h2
            className="land-section-title"
            dangerouslySetInnerHTML={{ __html: s.title }}
          />
          <p className="land-section-body">{s.body}</p>
        </div>

        <div className="programs">
          {s.items.map((p) => (
            <article
              key={p.n}
              className="program-card"
              data-featured={p.featured}
            >
              {p.featured && <span className="program-badge">Most popular</span>}
              <h3 className="program-title">{p.title}</h3>
              <p className="program-meta">{p.meta}</p>
              <ul className="program-list">
                {p.bullets.map((b, i) => (
                  <li key={i}>
                    <svg
                      className="check"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.5 9.5l3.5 3.5 8-8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="program-cta">
                {p.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
