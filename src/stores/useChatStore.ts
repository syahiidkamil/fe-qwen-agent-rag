import { create } from "zustand";

import { streamChat, type ChatStreamMessage, type SourceRef } from "@/services/ChatService";
import { SessionService } from "@/services/SessionService";
import { sourcesToChat } from "@/lib/chat-sources";
import type { ChatMessage, ChatSession } from "@/types/chat";
import { useConfigStore } from "@/stores/useConfigStore";
import { useAuthStore } from "@/stores/useAuthStore";

interface ChatState {
  sessionId: string | null;
  messages: ChatMessage[];
  draft: string;
  typing: boolean;
  /** Token-by-token in-flight assistant message text. */
  streaming: string;
  /** Sources for the in-flight assistant message. */
  pendingSources: SourceRef[];
  /** True once the BE has refused a send with INTERNAL_MODE_REQUIRES_AUTH.
   *  The widget shows the "Sign in to chat" gate over the existing
   *  conversation (greyed) until the user signs in or resets. */
  gated: boolean;
  /** The signed-in user's saved sessions, for the AI Help sidebar. Empty
   *  for anonymous visitors (the public widget never lists sessions). */
  sessions: ChatSession[];
  sessionsLoading: boolean;
  setDraft: (s: string) => void;
  send: (text?: string) => Promise<void>;
  reset: () => void;
  clearGate: () => void;
  /** Load the current user's session list (no-op when anonymous). */
  loadSessions: () => Promise<void>;
  /** Replace the active conversation with a saved session's history. */
  openSession: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

function welcomeMessage(): ChatMessage {
  const welcome = useConfigStore.getState().config.widget.welcome;
  return { id: "m0", role: "bot", text: welcome };
}

/**
 * Chat state is intentionally NOT persisted. The widget starts fresh on
 * every page load — same expectation as ChatGPT/Claude's "New chat". For
 * signed-in users the AI Help sidebar surfaces past sessions to reopen.
 */
export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: null,
  messages: [welcomeMessage()],
  draft: "",
  typing: false,
  streaming: "",
  pendingSources: [],
  gated: false,
  sessions: [],
  sessionsLoading: false,

  setDraft: (s) => set({ draft: s }),

  async send(text) {
    const content = (text ?? get().draft).trim();
    if (!content || get().typing) return;

    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      role: "user",
      text: content,
    };
    set({
      messages: [...get().messages, userMsg],
      draft: "",
      typing: true,
      streaming: "",
      pendingSources: [],
    });

    // Map UI message history to backend wire format. The widget's bot welcome
    // is excluded from history (it's UI-only).
    const wire: ChatStreamMessage[] = get()
      .messages.filter((m) => m.id !== "m0")
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));
    wire.push({ role: "user", content });

    let serverError: string | null = null;

    try {
      await streamChat(wire, get().sessionId, {
        onSession: (id) => set({ sessionId: id }),
        onSources: (refs) => set({ pendingSources: refs }),
        onToken: (delta) => set((s) => ({ streaming: s.streaming + delta })),
        onServerError: (msg) => {
          serverError = msg;
        },
        onAuthRequired: () => {
          // BE refused because chat_mode is internal and we're anonymous.
          // Drop the in-flight user turn back into draft so the visitor
          // can resend after signing in; flip into gated state to render
          // the "Sign in to chat" card.
          set((s) => ({
            messages: s.messages.filter((m) => m.id !== userMsg.id),
            draft: content,
            typing: false,
            streaming: "",
            pendingSources: [],
            gated: true,
          }));
        },
        onDone: (full) => {
          const fallback = serverError ? `⚠ ${serverError}` : full || get().streaming;
          const botMsg: ChatMessage = {
            id: `b${Date.now()}`,
            role: "bot",
            text: fallback,
            sources: sourcesToChat(get().pendingSources),
          };
          set({
            messages: [...get().messages, botMsg],
            typing: false,
            streaming: "",
            pendingSources: [],
          });
          // Refresh the sidebar so a freshly-created session shows up with
          // its auto-title and the list re-sorts by recent activity.
          // Self-guards on auth, so it's a no-op for anonymous visitors.
          void get().loadSessions();
        },
        onError: (err) => {
          const botMsg: ChatMessage = {
            id: `b${Date.now()}`,
            role: "bot",
            text: `Sorry — I couldn't reach the assistant (${err.message}).`,
          };
          set({
            messages: [...get().messages, botMsg],
            typing: false,
            streaming: "",
            pendingSources: [],
          });
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      set({
        messages: [
          ...get().messages,
          { id: `b${Date.now()}`, role: "bot", text: `Network error: ${msg}` },
        ],
        typing: false,
        streaming: "",
      });
    }
  },

  reset: () =>
    set({
      sessionId: null,
      messages: [welcomeMessage()],
      draft: "",
      typing: false,
      streaming: "",
      pendingSources: [],
      gated: false,
    }),

  clearGate: () => set({ gated: false }),

  async loadSessions() {
    if (!useAuthStore.getState().isAuthenticated) return;
    set({ sessionsLoading: true });
    try {
      const sessions = await SessionService.list();
      set({ sessions, sessionsLoading: false });
    } catch {
      // Keep whatever's listed; the sidebar shows its last-known state.
      set({ sessionsLoading: false });
    }
  },

  async openSession(id) {
    if (get().sessionId === id || get().typing) return;
    try {
      const { messages } = await SessionService.get(id);
      set({
        sessionId: id,
        // Prepend the welcome bubble so a reopened conversation reads the
        // same as a live one; it's filtered out of wire history on resend.
        messages: [welcomeMessage(), ...messages],
        draft: "",
        typing: false,
        streaming: "",
        pendingSources: [],
        gated: false,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("openSession failed:", err);
    }
  },

  async renameSession(id, title) {
    const updated = await SessionService.rename(id, title);
    set({ sessions: get().sessions.map((s) => (s.id === id ? updated : s)) });
  },

  async deleteSession(id) {
    await SessionService.remove(id);
    set({ sessions: get().sessions.filter((s) => s.id !== id) });
    // If the open conversation was the one deleted, fall back to a new chat.
    if (get().sessionId === id) get().reset();
  },
}));

useConfigStore.subscribe((s, prev) => {
  if (s.config.widget.welcome === prev.config.widget.welcome) return;
  const { messages } = useChatStore.getState();
  if (messages.length === 1 && messages[0].id === "m0") {
    useChatStore.setState({ messages: [welcomeMessage()] });
  }
});
