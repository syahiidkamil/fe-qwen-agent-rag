import { api } from "@/lib/api";

export interface SystemConfigBlob {
  retrieval_top_k?: number;
  retrieval_max_files?: number;
  relevance_threshold?: number;
}

/**
 * Read-only model identities the backend reports from its `.env`. Surfaced for
 * display only — not editable from the admin UI (change the backend's
 * `QWEN_VL_MODEL` and restart).
 */
export interface SystemRuntime {
  qwen_vl_model: string;
  qwen_embedding_model: string;
  qwen_temperature: number;
  qwen_top_p: number;
}

export const SystemConfigService = {
  async get(): Promise<{
    config: SystemConfigBlob;
    updatedAt: string | null;
    runtime: SystemRuntime | null;
  }> {
    const { data } = await api.get<{
      data: {
        config: SystemConfigBlob;
        updated_at: string | null;
        runtime: SystemRuntime | null;
      };
    }>("/api/system-config");
    return {
      config: data.data.config ?? {},
      updatedAt: data.data.updated_at,
      runtime: data.data.runtime ?? null,
    };
  },

  async save(config: SystemConfigBlob): Promise<void> {
    await api.put("/api/system-config", { config });
  },
};

export const RETRIEVAL_TOP_K_DEFAULT = 8;
export const RETRIEVAL_TOP_K_MIN = 1;
export const RETRIEVAL_TOP_K_MAX = 20;

export const RETRIEVAL_MAX_FILES_DEFAULT = 3;
export const RETRIEVAL_MAX_FILES_MIN = 1;
export const RETRIEVAL_MAX_FILES_MAX = 10;

// Relevance threshold operates on raw Reciprocal Rank Fusion scores (RRF_K=60),
// which are small — roughly 1/(60+rank) summed across two retrieval arms,
// typically well under ~0.04. Default 0 means NO filtering (backward-compatible).
export const RELEVANCE_THRESHOLD_DEFAULT = 0;
export const RELEVANCE_THRESHOLD_MIN = 0;
export const RELEVANCE_THRESHOLD_MAX = 1;
export const RELEVANCE_THRESHOLD_STEP = 0.001;
