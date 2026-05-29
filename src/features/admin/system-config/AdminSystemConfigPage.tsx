import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

import {
  RETRIEVAL_TOP_K_DEFAULT,
  RETRIEVAL_TOP_K_MAX,
  RETRIEVAL_TOP_K_MIN,
  SystemConfigService,
} from "@/services/SystemConfigService";

/**
 * Admin-tunable infra knobs. Currently exposes retrieval top-K — the
 * number of chunks the chat pipeline pulls into the LLM context per
 * question. Stored in the singleton `system_config` row server-side.
 */
export function AdminSystemConfigPage() {
  const [topK, setTopK] = useState<number>(RETRIEVAL_TOP_K_DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { config, updatedAt } = await SystemConfigService.get();
        setTopK(
          typeof config.retrieval_top_k === "number"
            ? config.retrieval_top_k
            : RETRIEVAL_TOP_K_DEFAULT,
        );
        setUpdatedAt(updatedAt);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not load system config";
        toast.error(msg);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const clamped = Math.max(
    RETRIEVAL_TOP_K_MIN,
    Math.min(RETRIEVAL_TOP_K_MAX, Math.round(topK || RETRIEVAL_TOP_K_DEFAULT)),
  );
  const outOfRange = clamped !== topK;

  const handleSave = async () => {
    setSaving(true);
    try {
      await SystemConfigService.save({ retrieval_top_k: clamped });
      setTopK(clamped);
      const fresh = await SystemConfigService.get();
      setUpdatedAt(fresh.updatedAt);
      toast.success("System config saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save system config";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">System config</span>
          <h1 className="page-title">Tune the retrieval pipeline</h1>
        </div>
      </div>

      <div style={{ maxWidth: 640 }}>
        <p style={{ color: "var(--ink-2)", fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
          How many of the top-ranked knowledge-base chunks the chat pipeline
          forwards into the LLM context for each question. Higher = more
          recall but longer prompts; lower = tighter context, faster, but
          may miss relevant passages.
        </p>

        <label className="field">
          <div className="field-label">Top-N chunks referenced in chat</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="number"
              min={RETRIEVAL_TOP_K_MIN}
              max={RETRIEVAL_TOP_K_MAX}
              step={1}
              value={loaded ? topK : ""}
              disabled={!loaded || saving}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="input"
              style={{ width: 120 }}
            />
            <span style={{ color: "var(--muted)", fontSize: 12 }}>
              allowed {RETRIEVAL_TOP_K_MIN}–{RETRIEVAL_TOP_K_MAX} · default{" "}
              {RETRIEVAL_TOP_K_DEFAULT}
            </span>
          </div>
          {outOfRange && (
            <div className="field-error">
              Out of range — will be saved as {clamped}.
            </div>
          )}
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn-teal btn-sm"
            onClick={handleSave}
            disabled={!loaded || saving}
          >
            <Save size={12} strokeWidth={1.8} />
            {saving ? "Saving…" : "Save"}
          </button>
          {updatedAt && (
            <span style={{ color: "var(--muted)", fontSize: 12 }}>
              Last updated {new Date(updatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
