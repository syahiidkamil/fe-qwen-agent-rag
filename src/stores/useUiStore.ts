import { create } from "zustand";

const LS_KEY = "aira:ui:sidebar_collapsed";

function readInitial(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LS_KEY) === "1";
  } catch {
    return false;
  }
}

function persist(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, value ? "1" : "0");
  } catch {
    /* ignore: private mode / disabled storage */
  }
}

interface UiState {
  /** True when the left sidebar is collapsed to icon-only width. */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: readInitial(),
  setSidebarCollapsed: (v) => {
    persist(v);
    set({ sidebarCollapsed: v });
  },
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    persist(next);
    set({ sidebarCollapsed: next });
  },
}));
