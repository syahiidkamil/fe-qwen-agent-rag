interface HeroPillProps {
  children: React.ReactNode;
}

export function HeroPill({ children }: HeroPillProps) {
  return (
    <span className="hero-pill">
      <span className="hero-pill-dot" aria-hidden="true" />
      {children}
    </span>
  );
}
