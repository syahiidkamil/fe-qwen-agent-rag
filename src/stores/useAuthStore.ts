import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

export const ROLES = ["super_admin", "admin", "user"] as const;
export type Role = (typeof ROLES)[number];

function extractRole(session: Session | null): Role | null {
  const value = session?.user?.user_metadata?.role;
  return typeof value === "string" && (ROLES as readonly string[]).includes(value)
    ? (value as Role)
    : null;
}

interface AuthState {
  initialized: boolean;
  isAuthenticated: boolean;
  /** Supabase auth user id (uuid). Stable across email changes; safer key. */
  userId: string | null;
  email: string | null;
  role: Role | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-pull the session — used after a self email change so the header
   *  reflects the new address without a re-login. */
  refresh: () => Promise<void>;
}

function applySession(
  set: (s: Partial<AuthState>) => void,
  session: Session | null,
) {
  set({
    isAuthenticated: !!session,
    userId: session?.user?.id ?? null,
    email: session?.user.email ?? null,
    role: extractRole(session),
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  initialized: false,
  isAuthenticated: false,
  userId: null,
  email: null,
  role: null,

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

  async refresh() {
    // refreshSession exchanges the refresh token for a new one whose user
    // object carries the latest email; onAuthStateChange also fires, but we
    // apply it here too so the update is synchronous for the caller.
    const { data } = await supabase.auth.refreshSession();
    applySession(set, data.session);
  },
}));
