import { create } from "zustand";

import { streamChat, type ChatStreamMessage, type SourceRef } from "@/services/ChatService";
import type { ChatMessage } from "@/types/chat";
import { useConfigStore } from "@/stores/useConfigStore";

interface ChatState {
  sessionId: string | null;
  messages: ChatMessage[];
  draft: string;
  typing: boolean;
  /** Token-by-token in-flight assistant message text. */
  streaming: string;
  /** Sources for the in-flight assistant message. */
  pendingSources: SourceRef[];
  setDraft: (s: string) => void;
  send: (text?: string) => Promise<void>;
  reset: () => void;
}

function welcomeMessage(): ChatMessage {
  const welcome = useConfigStore.getState().config.widget.welcome;
  return { id: "m0", role: "bot", text: welcome };
}

function sourcesToChat(refs: SourceRef[]): ChatMessage["sources"] {
  // Dedupe by document_id; prefer the real filename when the backend supplied one.
  const seen = new Set<string>();
  const out: NonNullable<ChatMessage["sources"]> = [];
  for (const r of refs) {
    if (seen.has(r.document_id)) continue;
    seen.add(r.document_id);
    out.push({
      id: r.document_id,
      name: r.filename || `doc-${r.document_id.slice(0, 6)}`,
      url: r.url ?? undefined,
    });
  }
  return out;
}

/**
 * Chat state is intentionally NOT persisted. The widget starts fresh on
 * every page load — same expectation as ChatGPT/Claude's "New chat".
 */
export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: null,
  messages: [welcomeMessage()],
  draft: "",
  typing: false,
  streaming: "",
  pendingSources: [],

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
    }),
}));

useConfigStore.subscribe((s, prev) => {
  if (s.config.widget.welcome === prev.config.widget.welcome) return;
  const { messages } = useChatStore.getState();
  if (messages.length === 1 && messages[0].id === "m0") {
    useChatStore.setState({ messages: [welcomeMessage()] });
  }
});
