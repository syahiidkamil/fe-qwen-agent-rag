import { api } from "@/lib/api";
import { sourcesToChat } from "@/lib/chat-sources";
import type { SourceRef } from "@/services/ChatService";
import type { ChatMessage, ChatSession } from "@/types/chat";

interface BackendSession {
  id: string;
  title: string | null;
  started_at: string;
  last_message_at: string;
}

interface BackendMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: SourceRef[] | null;
  created_at: string;
}

interface BackendSessionDetail extends BackendSession {
  messages: BackendMessage[];
}

function toSession(s: BackendSession): ChatSession {
  return {
    id: s.id,
    // Legacy/edge rows may lack a title; the sidebar still needs a label.
    title: s.title || "Untitled chat",
    startedAt: s.started_at,
    lastMessageAt: s.last_message_at,
  };
}

function toMessage(m: BackendMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role === "user" ? "user" : "bot",
    text: m.content,
    sources: m.sources && m.sources.length ? sourcesToChat(m.sources) : undefined,
  };
}

export const SessionService = {
  /** List the current user's sessions, most-recently-active first. */
  async list(): Promise<ChatSession[]> {
    const { data } = await api.get<{ data: BackendSession[] }>("/api/chat/sessions");
    return data.data.map(toSession);
  },

  /** Fetch a session with its full message history (oldest first). */
  async get(id: string): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
    const { data } = await api.get<{ data: BackendSessionDetail }>(
      `/api/chat/sessions/${id}`,
    );
    return {
      session: toSession(data.data),
      messages: data.data.messages.map(toMessage),
    };
  },

  /** Rename a session. */
  async rename(id: string, title: string): Promise<ChatSession> {
    const { data } = await api.patch<{ data: BackendSession }>(
      `/api/chat/sessions/${id}`,
      { title },
    );
    return toSession(data.data);
  },

  /** Delete a session (its messages cascade server-side). */
  async remove(id: string): Promise<void> {
    await api.delete(`/api/chat/sessions/${id}`);
  },
};
