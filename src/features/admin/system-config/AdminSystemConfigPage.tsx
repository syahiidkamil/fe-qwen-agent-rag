import { type CSSProperties, useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

import {
  RELEVANCE_THRESHOLD_DEFAULT,
  RELEVANCE_THRESHOLD_MAX,
  RELEVANCE_THRESHOLD_MIN,
  RETRIEVAL_MAX_FILES_DEFAULT,
  RETRIEVAL_MAX_FILES_MAX,
  RETRIEVAL_MAX_FILES_MIN,
  RETRIEVAL_TOP_K_DEFAULT,
  RETRIEVAL_TOP_K_MAX,
  RETRIEVAL_TOP_K_MIN,
  type SystemRuntime,
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

/**
 * Float clamp for the relevance threshold — unlike `clamp`, it must NOT round
 * (RRF scores live around 0.0–0.04, so rounding to an integer would destroy
 * every meaningful value). A non-finite input falls back to the default.
 */
function clampFloat(value: number, lo: number, hi: number, fallback: number): number {
  const n = Number.isFinite(value) ? value : fallback;
  return Math.max(lo, Math.min(hi, n));
}

/** Round to 2 decimal places — the threshold's max precision. */
function round2(n: number): number {
  return Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
}

/**
 * Sanitize raw text for the threshold field: normalize a comma to a dot (so the
 * value never renders with a locale-specific comma), keep a single decimal
 * point, and cap at 2 decimal places. A lone trailing dot is preserved so the
 * field stays typeable mid-entry.
 */
function sanitizeDecimal2(raw: string): string {
  let s = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const dot = s.indexOf(".");
  if (dot !== -1) {
    const intPart = s.slice(0, dot);
    const decPart = s.slice(dot + 1).replace(/\./g, "").slice(0, 2);
    s = `${intPart}.${decPart}`;
  }
  return s;
}

/** Render a numeric threshold as text with a dot separator, at most 2 decimals. */
function formatThreshold(n: number): string {
  return String(round2(n));
}

/** Monospace stack for rendering model identities and env keys verbatim. */
const MONO: CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

/** One read-only env-sourced fact (label + value) in the runtime card. */
function RuntimeFact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          color: "var(--muted-2)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      <span style={{ ...MONO, fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>
        {value}
      </span>
    </div>
  );
}

export function AdminSystemConfigPage() {
  const [topK, setTopK] = useState<number>(RETRIEVAL_TOP_K_DEFAULT);
  const [maxFiles, setMaxFiles] = useState<number>(RETRIEVAL_MAX_FILES_DEFAULT);
  const [thresholdText, setThresholdText] = useState<string>(
    formatThreshold(RELEVANCE_THRESHOLD_DEFAULT),
  );
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<SystemRuntime | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { config, updatedAt, runtime } = await SystemConfigService.get();
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
        setThresholdText(
          formatThreshold(
            typeof config.relevance_threshold === "number"
              ? config.relevance_threshold
              : RELEVANCE_THRESHOLD_DEFAULT,
          ),
        );
        setUpdatedAt(updatedAt);
        setRuntime(runtime);
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
  const parsedThreshold =
    thresholdText.trim() === "" || thresholdText.trim() === "."
      ? RELEVANCE_THRESHOLD_DEFAULT
      : Number(thresholdText);
  const clampedRelevanceThreshold = round2(
    clampFloat(
      parsedThreshold,
      RELEVANCE_THRESHOLD_MIN,
      RELEVANCE_THRESHOLD_MAX,
      RELEVANCE_THRESHOLD_DEFAULT,
    ),
  );
  const topKOutOfRange = clampedTopK !== topK;
  const maxFilesOutOfRange = clampedMaxFiles !== maxFiles;
  const relevanceThresholdOutOfRange =
    Number.isFinite(parsedThreshold) && clampedRelevanceThreshold !== parsedThreshold;

  const handleSave = async () => {
    setSaving(true);
    try {
      await SystemConfigService.save({
        retrieval_top_k: clampedTopK,
        retrieval_max_files: clampedMaxFiles,
        relevance_threshold: clampedRelevanceThreshold,
      });
      setTopK(clampedTopK);
      setMaxFiles(clampedMaxFiles);
      setThresholdText(formatThreshold(clampedRelevanceThreshold));
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
        {runtime && (
          <div
            style={{
              border: "1px solid var(--rule)",
              background: "var(--paper-2)",
              borderRadius: "var(--r-md)",
              padding: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div className="field-label" style={{ marginBottom: 0 }}>
                Active model
              </div>
              <span
                style={{
                  color: "var(--muted-2)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Read-only · from backend env
              </span>
            </div>
            <div style={{ ...MONO, fontSize: 15, fontWeight: 600, color: "var(--teal)", marginTop: 8 }}>
              {runtime.qwen_vl_model}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px 28px",
                marginTop: 14,
                paddingTop: 14,
                borderTop: "1px solid var(--rule-2)",
              }}
            >
              <RuntimeFact label="Embedding" value={runtime.qwen_embedding_model} />
              <RuntimeFact label="Temperature" value={String(runtime.qwen_temperature)} />
              <RuntimeFact label="Top-p" value={String(runtime.qwen_top_p)} />
            </div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 12, lineHeight: 1.5 }}>
              The Qwen vision-language model answers every chat turn and reads
              page images at ingest; temperature and top-p control generation
              sampling. These come from the backend environment — to change them,
              edit the backend <code style={MONO}>.env</code> (
              <code style={MONO}>QWEN_VL_MODEL</code>,{" "}
              <code style={MONO}>QWEN_TEMPERATURE</code>,{" "}
              <code style={MONO}>QWEN_TOP_P</code>) and restart.
            </div>
          </div>
        )}

        <p style={{ color: "var(--ink-2)", fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
          The retrieval pipeline ranks knowledge-base chunks for each chat
          question. These caps and the relevance threshold control how much
          makes it into the LLM context, how focused the citation list stays,
          and how aggressively low-scoring chunks are filtered out.
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

        <label className="field">
          <div className="field-label">Relevance threshold</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="text"
              inputMode="decimal"
              lang="en-US"
              value={loaded ? thresholdText : ""}
              disabled={!loaded || saving}
              onChange={(e) => setThresholdText(sanitizeDecimal2(e.target.value))}
              onBlur={() => setThresholdText(formatThreshold(clampedRelevanceThreshold))}
              className="input"
              style={{ width: 120 }}
              placeholder="0"
              aria-label="Relevance threshold, 0 to 1, up to 2 decimals"
            />
            <span style={{ color: "var(--muted)", fontSize: 12 }}>
              {RELEVANCE_THRESHOLD_MIN}–{RELEVANCE_THRESHOLD_MAX} · max 2 decimals ·
              default {RELEVANCE_THRESHOLD_DEFAULT} · 0 disables filtering
            </span>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
            Filters out files whose semantic similarity to your question is below
            this. Similarity runs 0–1 (higher = stricter); 0 disables filtering.
            Turn on Debug Mode in chat to read each file's similarity and calibrate.
          </div>
          {relevanceThresholdOutOfRange && (
            <div className="field-error">
              Out of range — will be saved as {clampedRelevanceThreshold}.
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
