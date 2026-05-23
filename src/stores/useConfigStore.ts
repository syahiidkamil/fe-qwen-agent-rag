import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LandingConfig, PresetId } from "@/types/config";
import { DEFAULT_CONFIG, PRESETS } from "@/lib/mock-data";

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface ConfigState {
  config: LandingConfig;
  setConfig: (next: LandingConfig) => void;
  patchConfig: (patch: DeepPartial<LandingConfig>) => void;
  resetConfig: () => void;
  loadPreset: (id: PresetId) => void;
  exportConfig: () => void;
  importConfig: (file: File) => Promise<void>;
}

const NESTED_KEYS = [
  "hero",
  "trust",
  "section1",
  "stats",
  "section2",
  "footer",
  "theme",
  "widget",
  "layout",
] as const;

function mergeConfig(
  base: LandingConfig,
  patch: DeepPartial<LandingConfig>,
): LandingConfig {
  const out = { ...base, ...patch } as LandingConfig;
  for (const k of NESTED_KEYS) {
    if (patch[k]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out[k] = { ...(base[k] as any), ...(patch[k] as any) };
    }
  }
  if (patch.hero?.card && base.hero?.card) {
    out.hero = {
      ...out.hero,
      card: { ...base.hero.card, ...patch.hero.card },
    };
  }
  return out;
}

function applyTheme(config: LandingConfig) {
  const accent = config.theme?.accent;
  if (!accent || typeof document === "undefined") return;
  document.documentElement.style.setProperty("--teal", accent);
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      setConfig: (next) => {
        applyTheme(next);
        set({ config: next });
      },
      patchConfig: (patch) => {
        const next = mergeConfig(get().config, patch);
        applyTheme(next);
        set({ config: next });
      },
      resetConfig: () => {
        applyTheme(DEFAULT_CONFIG);
        set({ config: DEFAULT_CONFIG });
      },
      loadPreset: (id) => {
        const preset = PRESETS[id];
        if (!preset) return;
        applyTheme(preset.config);
        set({ config: preset.config });
      },
      exportConfig: () => {
        const cfg = get().config;
        const blob = new Blob([JSON.stringify(cfg, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${cfg.brand.toLowerCase().replace(/\s+/g, "-")}-config.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      importConfig: (file) =>
        new Promise<void>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => {
            try {
              const obj = JSON.parse(r.result as string);
              const next = mergeConfig(DEFAULT_CONFIG, obj);
              applyTheme(next);
              set({ config: next });
              resolve();
            } catch (e) {
              reject(e);
            }
          };
          r.onerror = () => reject(new Error("File read error"));
          r.readAsText(file);
        }),
    }),
    {
      name: "airanext.config.v2",
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state?.config) applyTheme(state.config);
      },
    },
  ),
);
