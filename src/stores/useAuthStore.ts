import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

interface AuthState {
  initialized: boolean;
  isAuthenticated: boolean;
  email: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

function applySession(set: (s: Partial<AuthState>) => void, session: Session | null) {
  set({
    isAuthenticated: !!session,
    email: session?.user.email ?? null,
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  initialized: false,
  isAuthenticated: false,
  email: null,

  async init() {
    if (get().initialized) return;
    const { data } = await supabase.auth.getSession();
    applySession(set, data.session);
    set({ initialized: true });

    supabase.auth.onAuthStateChange((_event, session) => {
      applySession(set, session);
    });
  },

  async login(email, password) {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    applySession(set, data.session);
  },

  async logout() {
    await supabase.auth.signOut();
    applySession(set, null);
  },
}));
