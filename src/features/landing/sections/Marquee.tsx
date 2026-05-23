interface MarqueeProps {
  items: string[];
}

export function Marquee({ items }: MarqueeProps) {
  const doubled = [...items, ...items];
  return (
    <section className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((it, i) => (
          <span className="marquee-item" key={i}>
            {it}
          </span>
        ))}
      </div>
    </section>
  );
}
