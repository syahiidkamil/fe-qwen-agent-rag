import { api } from "@/lib/api";

export interface SystemConfigBlob {
  retrieval_top_k?: number;
  retrieval_max_files?: number;
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
