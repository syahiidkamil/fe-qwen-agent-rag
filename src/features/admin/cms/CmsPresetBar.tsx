import { toast } from "sonner";
import { useConfigStore } from "@/stores/useConfigStore";
import { PRESETS } from "@/lib/mock-data";

export function CmsPresetBar() {
  const config = useConfigStore((s) => s.config);
  const loadPreset = useConfigStore((s) => s.loadPreset);

  return (
    <div className="preset-bar">
      <div className="preset-bar-label">
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10.5,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          Identity preset
        </span>
        <span style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>
          Same DOM, different brand — clears your edits and loads a baseline.
        </span>
      </div>
      <div className="preset-bar-options">
        {Object.values(PRESETS).map((p) => (
          <button
            type="button"
            key={p.id}
            className="preset-chip"
            data-on={config.brand === p.config.brand}
            onClick={() => {
              loadPreset(p.id);
              toast(`Loaded preset: ${p.label}`);
            }}
          >
            <span
              className="preset-chip-swatch"
              style={{ background: p.config.theme.accent }}
            />
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
