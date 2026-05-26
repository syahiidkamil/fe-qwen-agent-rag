import { ChatPanel } from "@/components/chatbot/ChatPanel";

/**
 * Full-page AI Help surface. ChatPanel's fullPage variant fills the
 * `.ai-help-shell` wrapper, which extends to the bottom of the viewport
 * minus the workspace topbar. The wrapper escapes `.admin-content`'s
 * padding so the chat input row sits flush with the bottom edge.
 */
export function AiHelpPage() {
  return (
    <div className="ai-help-shell">
      <ChatPanel fullPage />
    </div>
  );
}
