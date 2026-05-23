import type { LandingConfig } from "@/types/config";

interface StatsStripProps {
  config: LandingConfig;
}

export function StatsStrip({ config }: StatsStripProps) {
  return (
    <section className="stats-strip">
      <div className="stats-inner">
        {config.stats.items.map((s, i) => (
          <div key={i} className="stat">
            <div
              className="stat-num"
              dangerouslySetInnerHTML={{ __html: s.num }}
            />
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
