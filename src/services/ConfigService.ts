import { api } from "@/lib/api";
import type { LandingConfig } from "@/types/config";

export const ConfigService = {
  async get(): Promise<{ config: LandingConfig | null; updatedAt: string | null }> {
    const { data } = await api.get<{ data: { config: LandingConfig; updated_at: string | null } }>(
      "/api/landing-config",
    );
    const c = data.data;
    // The first call against an empty DB returns `config: {}`. Caller decides
    // whether to fall back to DEFAULT_CONFIG.
    const hasConfig = c.config && Object.keys(c.config).length > 0;
    return { config: hasConfig ? (c.config as LandingConfig) : null, updatedAt: c.updated_at };
  },

  async save(config: LandingConfig): Promise<void> {
    await api.put("/api/landing-config", { config });
  },
};
