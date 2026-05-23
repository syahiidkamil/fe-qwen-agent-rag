import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage } from "@/types/chat";
import { fakeReply } from "@/lib/fake-reply";
import { useFilesStore } from "@/stores/useFilesStore";
import { useConfigStore } from "@/stores/useConfigStore";

interface ChatState {
  messages: ChatMessage[];
  draft: string;
  typing: boolean;
  setDraft: (s: string) => void;
  send: (text?: string) => void;
  reset: () => void;
}

function welcomeMessage(): ChatMessage {
  const welcome = useConfigStore.getState().config.widget.welcome;
  return { id: "m0", role: "bot", text: welcome };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [welcomeMessage()],
      draft: "",
      typing: false,

      setDraft: (s) => set({ draft: s }),

      send: (text) => {
        const content = (text ?? get().draft).trim();
        if (!content) return;
        const userMsg: ChatMessage = {
          id: `u${Date.now()}`,
          role: "user",
          text: content,
        };
        set({
          messages: [...get().messages, userMsg],
          draft: "",
          typing: true,
        });
        const files = useFilesStore.getState().files;
        const { body, sources } = fakeReply(content, files);
        setTimeout(() => {
          const botMsg: ChatMessage = {
            id: `b${Date.now()}`,
            role: "bot",
            text: body,
            sources,
          };
          set({ messages: [...get().messages, botMsg], typing: false });
        }, 700);
      },

      reset: () => set({ messages: [welcomeMessage()], draft: "", typing: false }),
    }),
    {
      name: "airanext.chat.v2",
      version: 1,
      partialize: (s) => ({ messages: s.messages }),
    },
  ),
);

// Refresh welcome message when widget config changes and we're still on the
// initial welcome-only state (mirrors reference behavior).
useConfigStore.subscribe((s, prev) => {
  if (s.config.widget.welcome === prev.config.widget.welcome) return;
  const { messages } = useChatStore.getState();
  if (messages.length === 1 && messages[0].id === "m0") {
    useChatStore.setState({ messages: [welcomeMessage()] });
  }
});
