import { useConfigStore } from "@/stores/useConfigStore";

interface BrandMarkProps {
  size?: number;
}

/**
 * The brand logo. Pure presentational: reads the super-admin-uploaded
 * `logo_url` from the config store and, when present, renders that image in
 * place of the default inline-SVG mark — so a single upload overrides the
 * logo for every user, everywhere this component is used.
 */
export function BrandMark({ size = 26 }: BrandMarkProps) {
  const logoUrl = useConfigStore((s) => s.config.logo_url);
  const brand = useConfigStore((s) => s.config.brand);

  if (typeof logoUrl === "string" && logoUrl.length > 0) {
    return (
      <img
        src={logoUrl}
        alt={brand || "Logo"}
        style={{
          height: size,
          width: "auto",
          // Non-square logos (wordmarks) stay legible without blowing out the
          // layout; tall/wide ones are clamped and letterboxed via contain.
          maxWidth: size * 3,
          objectFit: "contain",
          display: "block",
          borderRadius: 6,
        }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="24" height="24" rx="6" fill="#061B22" />
      <path d="M13 5L20 19H17.5L13 9.5L8.5 19H6L13 5Z" fill="#FFFFFF" />
      <circle cx="13" cy="19.5" r="2" fill="var(--teal, #1FC7AE)" />
    </svg>
  );
}
