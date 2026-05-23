import { Link } from "react-router";
import { BrandMark } from "@/components/shared/BrandMark";
import type { LandingConfig } from "@/types/config";

function pillFromBrand(brand: string): string {
  if (!brand) return "";
  const parts = brand.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

interface LandingNavProps {
  config: LandingConfig;
}

export function LandingNav({ config }: LandingNavProps) {
  const chip = pillFromBrand(config.brand);
  const head = chip
    ? config.brand.replace(new RegExp(`\\s+${chip}$`), "")
    : config.brand;
  const ctaShort = (config.hero.ctaPrimary || "Get started")
    .split(" ")
    .slice(0, 2)
    .join(" ");

  return (
    <nav className="land-nav">
      <div className="land-nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span className="brand-name">
            {head}
            {chip && <span className="brand-chip">{chip}</span>}
          </span>
        </Link>
        <div className="land-nav-links">
          {config.nav.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {item}
            </a>
          ))}
        </div>
        <div className="land-nav-right">
          <Link to="/login" className="land-nav-login">
            Log in
          </Link>
          <a href="#apply" className="btn btn-teal btn-sm">
            {ctaShort}
          </a>
        </div>
      </div>
    </nav>
  );
}
