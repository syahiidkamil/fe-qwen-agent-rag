interface BrandMarkProps {
  size?: number;
}

export function BrandMark({ size = 26 }: BrandMarkProps) {
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
