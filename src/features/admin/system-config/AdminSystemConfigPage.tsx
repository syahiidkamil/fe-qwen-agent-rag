import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

import {
  RETRIEVAL_MAX_FILES_DEFAULT,
  RETRIEVAL_MAX_FILES_MAX,
  RETRIEVAL_MAX_FILES_MIN,
  RETRIEVAL_TOP_K_DEFAULT,
  RETRIEVAL_TOP_K_MAX,
  RETRIEVAL_TOP_K_MIN,
  SystemConfigService,
} from "@/services/SystemConfigService";

/**
 * Admin-tunable infra knobs.
 *
 * - Chunk cap controls how many ranked passages the chat pipeline
 *   forwards to the LLM (prompt budget).
 * - File cap caps how many distinct source documents appear — applied
 *   after RRF ranking, in rank order. Stops one document from
 *   dominating the context and keeps the source-chip list focused.
 */
function clamp(value: number, lo: number, hi: number, fallback: number): number {
  const n = Math.round(value || fallback);
  return Math.max(lo, Math.min(hi, n));
}

export function AdminSystemConfigPage() {
  const [topK, setTopK] = useState<number>(RETRIEVAL_TOP_K_DEFAULT);
  const [maxFiles, setMaxFiles] = useState<number>(RETRIEVAL_MAX_FILES_DEFAULT);
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
        setMaxFiles(
          typeof config.retrieval_max_files === "number"
            ? config.retrieval_max_files
            : RETRIEVAL_MAX_FILES_DEFAULT,
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

  const clampedTopK = clamp(
    topK,
    RETRIEVAL_TOP_K_MIN,
    RETRIEVAL_TOP_K_MAX,
    RETRIEVAL_TOP_K_DEFAULT,
  );
  const clampedMaxFiles = clamp(
    maxFiles,
    RETRIEVAL_MAX_FILES_MIN,
    RETRIEVAL_MAX_FILES_MAX,
    RETRIEVAL_MAX_FILES_DEFAULT,
  );
  const topKOutOfRange = clampedTopK !== topK;
  const maxFilesOutOfRange = clampedMaxFiles !== maxFiles;

  const handleSave = async () => {
    setSaving(true);
    try {
      await SystemConfigService.save({
        retrieval_top_k: clampedTopK,
        retrieval_max_files: clampedMaxFiles,
      });
      setTopK(clampedTopK);
      setMaxFiles(clampedMaxFiles);
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
          The retrieval pipeline ranks knowledge-base chunks for each chat
          question. These two caps control how much makes it into the LLM
          context and how focused the citation list stays.
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
              {RETRIEVAL_TOP_K_MIN}–{RETRIEVAL_TOP_K_MAX} · default {RETRIEVAL_TOP_K_DEFAULT} ·
              caps prompt budget
            </span>
          </div>
          {topKOutOfRange && (
            <div className="field-error">
              Out of range — will be saved as {clampedTopK}.
            </div>
          )}
        </label>

        <label className="field">
          <div className="field-label">Max distinct files cited per answer</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="number"
              min={RETRIEVAL_MAX_FILES_MIN}
              max={RETRIEVAL_MAX_FILES_MAX}
              step={1}
              value={loaded ? maxFiles : ""}
              disabled={!loaded || saving}
              onChange={(e) => setMaxFiles(Number(e.target.value))}
              className="input"
              style={{ width: 120 }}
            />
            <span style={{ color: "var(--muted)", fontSize: 12 }}>
              {RETRIEVAL_MAX_FILES_MIN}–{RETRIEVAL_MAX_FILES_MAX} · default{" "}
              {RETRIEVAL_MAX_FILES_DEFAULT} · caps citation diversity
            </span>
          </div>
          {maxFilesOutOfRange && (
            <div className="field-error">
              Out of range — will be saved as {clampedMaxFiles}.
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
