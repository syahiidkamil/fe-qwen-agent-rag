import type { LandingConfig } from "@/types/config";

interface HeroSectionProps {
  config: LandingConfig;
}

export function HeroSection({ config }: HeroSectionProps) {
  const h = config.hero;
  const t = config.trust;
  const showTrust = config.layout.showTrust !== false && !!t?.count;

  return (
    <header className="land-hero" id="apply">
      <div className="land-hero-bg" aria-hidden="true" />
      <div className="land-hero-inner">
        <div className="hero-pill">
          <span className="hero-pill-dot" aria-hidden="true" />
          {h.eyebrow}
        </div>
        <h1
          className="hero-title"
          dangerouslySetInnerHTML={{ __html: h.title }}
        />
        <p className="hero-body">{h.body}</p>
        <div className="hero-cta-row">
          <a href="#apply" className="btn btn-ink btn-lg">
            {h.ctaPrimary}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
          <a href="#curriculum" className="btn btn-outline btn-lg">
            {h.ctaSecondary}
          </a>
        </div>

        {showTrust && (
          <div className="hero-trust">
            <div className="hero-trust-avatars">
              {t.avatars.map((bg, i) => (
                <span
                  key={i}
                  className="hero-trust-av"
                  style={{ background: bg }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="hero-trust-text">
              Joined by <b>{t.count}</b> {t.sub}
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
