import { api } from "@/lib/api";

export interface SystemConfigBlob {
  retrieval_top_k?: number;
  retrieval_max_files?: number;
  relevance_threshold?: number;
}

export const SystemConfigService = {
  async get(): Promise<{ config: SystemConfigBlob; updatedAt: string | null }> {
    const { data } = await api.get<{
      data: { config: SystemConfigBlob; updated_at: string | null };
    }>("/api/system-config");
    return { config: data.data.config ?? {}, updatedAt: data.data.updated_at };
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
