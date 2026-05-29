import { api } from "@/lib/api";

export type UserRole = "super_admin" | "admin" | "user";
export type UserStatus = "active" | "deactivated";

export interface ManagedUser {
  id: string;
  email: string;
  role: UserRole | null;
  status: UserStatus;
  created_at: string | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
}

export const UserService = {
  async list(): Promise<ManagedUser[]> {
    const { data } = await api.get<{ data: ManagedUser[] }>("/api/users");
    return data.data;
  },

  async create(input: CreateUserInput): Promise<ManagedUser> {
    const { data } = await api.post<{ data: ManagedUser }>("/api/users", input);
    return data.data;
  },

  async updateEmail(id: string, email: string): Promise<ManagedUser> {
    const { data } = await api.patch<{ data: ManagedUser }>(
      `/api/users/${id}`,
      { email },
    );
    return data.data;
  },

  async deactivate(id: string): Promise<ManagedUser> {
    const { data } = await api.patch<{ data: ManagedUser }>(
      `/api/users/${id}/deactivate`,
    );
    return data.data;
  },

  async reactivate(id: string): Promise<ManagedUser> {
    const { data } = await api.patch<{ data: ManagedUser }>(
      `/api/users/${id}/reactivate`,
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    // Hard delete — 204 No Content, no body to unwrap.
    await api.delete(`/api/users/${id}`);
  },
};
