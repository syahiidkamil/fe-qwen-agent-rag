import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMode, LandingConfig, PresetId } from "@/types/config";
import { DEFAULT_CONFIG, PRESETS } from "@/lib/mock-data";
import { ConfigService } from "@/services/ConfigService";

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface ConfigState {
  config: LandingConfig;
  /** The chat_mode last persisted to the backend. `null` before first load.
   *  Used by the CMS form to show "Currently: …" + dashed border when the
   *  in-memory radio differs from what's actually saved. */
  lastSavedChatMode: ChatMode | null;
  /** Tracks the backend fetch lifecycle so route gates can show a loader
   *  before deciding whether to render the landing page or redirect. Not
   *  persisted — every page load starts from "idle". */
  loadStatus: "idle" | "loading" | "loaded" | "error";
  setConfig: (next: LandingConfig) => void;
  patchConfig: (patch: DeepPartial<LandingConfig>) => void;
  resetConfig: () => void;
  loadPreset: (id: PresetId) => void;
  exportConfig: () => void;
  importConfig: (file: File) => Promise<void>;
  loadFromBackend: () => Promise<void>;
  saveToBackend: () => Promise<void>;
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
      out[k] = { ...(base[k] as any), ...(patch[k] as any) } as any;
    }
  }
  if (patch.hero?.card && base.hero?.card) {
    out.hero = {
      ...out.hero,
      card: { ...base.hero.card, ...patch.hero.card } as LandingConfig["hero"]["card"],
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
      lastSavedChatMode: null,
      loadStatus: "idle",
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
      loadFromBackend: async () => {
        set({ loadStatus: "loading" });
        try {
          const { config } = await ConfigService.get();
          if (config) {
            applyTheme(config);
            set({
              config,
              lastSavedChatMode: config.chat_mode ?? "public",
              loadStatus: "loaded",
            });
          } else {
            set({ loadStatus: "loaded" });
          }
        } catch (err) {
          // Network/backend unavailable — keep whatever's in local state.
          // eslint-disable-next-line no-console
          console.warn("ConfigService.get failed; using local state:", err);
          set({ loadStatus: "error" });
        }
      },
      saveToBackend: async () => {
        const cfg = get().config;
        await ConfigService.save(cfg);
        set({ lastSavedChatMode: cfg.chat_mode ?? "public" });
      },
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
