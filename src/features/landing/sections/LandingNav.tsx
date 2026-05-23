import { Link, useNavigate } from "react-router";
import { BrandMark } from "@/components/shared/BrandMark";
import { useAuthStore } from "@/stores/useAuthStore";
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
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const chip = pillFromBrand(config.brand);
  const head = chip
    ? config.brand.replace(new RegExp(`\\s+${chip}$`), "")
    : config.brand;
  const ctaShort = (config.hero.ctaPrimary || "Get started")
    .split(" ")
    .slice(0, 2)
    .join(" ");

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

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
          {isAuthenticated ? (
            <>
              <Link to="/admin/cms" className="land-nav-login">
                Admin
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="land-nav-login"
              >
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="land-nav-login">
              Log in
            </Link>
          )}
          <a href="#apply" className="btn btn-teal btn-sm">
            {ctaShort}
          </a>
        </div>
      </div>
    </nav>
  );
}
