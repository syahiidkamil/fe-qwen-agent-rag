import { create } from "zustand";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { UserService, type CreateUserInput, type ManagedUser } from "@/services/UserService";

interface UsersState {
  users: ManagedUser[];
  loading: boolean;
  refresh: () => Promise<void>;
  create: (input: CreateUserInput) => Promise<ManagedUser>;
  deactivate: (id: string) => Promise<void>;
  reactivate: (id: string) => Promise<void>;
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,

  async refresh() {
    set({ loading: true });
    try {
      const users = await UserService.list();
      set({ users });
    } catch (err) {
      toast.error(`Failed to load users: ${describeError(err)}`);
    } finally {
      set({ loading: false });
    }
  },

  async create(input) {
    // Throws on failure so the dialog can surface inline errors without a toast.
    const created = await UserService.create(input);
    set({ users: [created, ...get().users] });
    return created;
  },

  async deactivate(id) {
    try {
      const updated = await UserService.deactivate(id);
      set((s) => ({ users: s.users.map((u) => (u.id === id ? updated : u)) }));
    } catch (err) {
      toast.error(`Deactivate failed: ${describeError(err)}`);
    }
  },

  async reactivate(id) {
    try {
      const updated = await UserService.reactivate(id);
      set((s) => ({ users: s.users.map((u) => (u.id === id ? updated : u)) }));
    } catch (err) {
      toast.error(`Reactivate failed: ${describeError(err)}`);
    }
  },
}));
