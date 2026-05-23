import type { CSSProperties } from "react";
import type { LandingConfig } from "@/types/config";

interface FlowSectionProps {
  config: LandingConfig;
}

export function FlowSection({ config }: FlowSectionProps) {
  const s = config.section2;
  const items = s.items;
  const style = { "--flow-count": items.length } as CSSProperties;

  return (
    <section
      className="land-section land-section-alt"
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

        <div className="flow" style={style}>
          {items.map((step, i) => {
            const last = i === items.length - 1;
            return (
              <div key={i} className="flow-step" data-last={last}>
                <div className="flow-num" data-last={last}>
                  {step.n}
                </div>
                {!last && <div className="flow-line" aria-hidden="true" />}
                <h4 className="flow-title">{step.t}</h4>
                <p className="flow-body">{step.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
