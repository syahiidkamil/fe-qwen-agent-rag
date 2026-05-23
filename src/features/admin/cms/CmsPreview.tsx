import { useEffect, useRef } from "react";
import { useConfigStore } from "@/stores/useConfigStore";

export function CmsPreview() {
  const brand = useConfigStore((s) => s.config.brand);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewUrl = `${brand.toLowerCase().replace(/\s+/g, "")}.com`;

  useEffect(() => {
    const unsub = useConfigStore.subscribe(() => {
      const win = iframeRef.current?.contentWindow;
      if (win) win.postMessage({ type: "airanext:config:updated" }, "*");
    });
    return unsub;
  }, []);

  return (
    <div>
      <div className="cms-preview-card">
        <div className="cms-preview-bar">
          <div className="dots">
            <span />
            <span />
            <span />
          </div>
          <span className="cms-preview-url">{previewUrl}</span>
        </div>
        <div className="cms-preview-body">
          <iframe
            ref={iframeRef}
            src="/?preview=1"
            className="cms-preview-iframe"
            title="Landing preview"
          />
        </div>
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: "var(--mono)",
          fontSize: 10.5,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          <span
            style={{
              width: 6,
              height: 6,
              background: "var(--green)",
              borderRadius: 99,
              display: "inline-block",
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
          autosaving
        </span>
        <a href="/" target="_blank" rel="noopener" style={{ color: "var(--teal-deep)" }}>
          open full page ↗
        </a>
      </div>
    </div>
  );
}
