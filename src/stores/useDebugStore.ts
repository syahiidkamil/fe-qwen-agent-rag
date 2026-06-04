import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Admin-only Debug Mode flag, persisted to localStorage so it survives reloads.
 *
 * Holds nothing sensitive — it only toggles whether the chat UI reveals raw
 * per-source RRF scores. Consumers MUST still gate on `isAdmin` (role check)
 * before showing debug info; this flag is a convenience, not an authorization
 * boundary (a non-admin could hand-edit localStorage).
 */
interface DebugState {
  debugMode: boolean;
  setDebugMode: (on: boolean) => void;
  toggleDebugMode: () => void;
}

export const useDebugStore = create<DebugState>()(
  persist(
    (set, get) => ({
      debugMode: false,
      setDebugMode: (on) => set({ debugMode: on }),
      toggleDebugMode: () => set({ debugMode: !get().debugMode }),
    }),
    {
      name: "enigma-debug",
      version: 1,
    },
  ),
);
