import { Link } from "react-router";
import { BrandMark } from "@/components/shared/BrandMark";
import type { LandingConfig } from "@/types/config";

interface LandingFooterProps {
  config: LandingConfig;
}

function FooterLink({ label }: { label: string }) {
  const isMail = label.includes("@");
  const isSign = /sign\s?in|log\s?in/i.test(label);
  if (isSign) {
    return <Link to="/login">{label}</Link>;
  }
  if (isMail) {
    return <a href={`mailto:${label}`}>{label}</a>;
  }
  return <a href="#">{label}</a>;
}

export function LandingFooter({ config }: LandingFooterProps) {
  const f = config.footer;
  const showBigWord = config.layout.showFooterBigWord !== false;

  return (
    <footer className="land-footer">
      {f.bigWord && showBigWord && (
        <div className="land-footer-word" aria-hidden="true">
          {f.bigWord}
        </div>
      )}
      <div className="land-footer-inner">
        <div className="foot-grid">
          <div className="foot-col foot-col-brand">
            <div className="brand">
              <span className="brand-mark">
                <BrandMark />
              </span>
              <span className="brand-name" style={{ color: "#fff" }}>
                {config.brand}
              </span>
            </div>
            <p className="foot-intro">{f.intro}</p>
          </div>
          {f.columns.map((col) => (
            <div className="foot-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l}>
                    <FooterLink label={l} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="foot-bottom">
          <span>{f.bottomLeft}</span>
          <div className="foot-socials">
            <a href="#" aria-label="Twitter">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8.29 20.25c7.55 0 11.68-6.25 11.68-11.68v-.53A8.35 8.35 0 0 0 22 5.92a8.19 8.19 0 0 1-2.36.65 4.12 4.12 0 0 0 1.8-2.27 8.22 8.22 0 0 1-2.6 1 4.11 4.11 0 0 0-7 3.74 11.65 11.65 0 0 1-8.46-4.29 4.11 4.11 0 0 0 1.27 5.48A4.07 4.07 0 0 1 2.8 9.71v.05a4.1 4.1 0 0 0 3.3 4.02 4.1 4.1 0 0 1-1.86.07 4.11 4.11 0 0 0 3.84 2.85A8.23 8.23 0 0 1 2 18.41a11.62 11.62 0 0 0 6.29 1.84z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5zM8 19H5V8h3v11zM6.5 6.73a1.77 1.77 0 1 1 0-3.53 1.77 1.77 0 0 1 0 3.53zM20 19h-3v-5.6c0-3.37-4-3.11-4 0V19h-3V8h3v1.77c1.4-2.59 7-2.78 7 2.47V19z" />
              </svg>
            </a>
            <a href="#" aria-label="GitHub">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.16c-3.34.72-4.04-1.41-4.04-1.41-.54-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.08 1.84 2.81 1.3 3.5 1 .1-.78.42-1.3.76-1.6-2.66-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.13 3.18a4.65 4.65 0 0 1 1.24 3.23c0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .3" />
              </svg>
            </a>
          </div>
          <span>
            {f.bottomCenter} · {f.bottomRight}
          </span>
        </div>
      </div>
    </footer>
  );
}
