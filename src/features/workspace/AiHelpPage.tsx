import { ChatPanel } from "@/components/chatbot/ChatPanel";
import { ChatSessionsSidebar } from "@/features/workspace/ChatSessionsSidebar";

/**
 * Full-page AI Help surface: a per-user session list on the left and the
 * full-page ChatPanel on the right. The `.ai-help-shell` wrapper fills the
 * viewport below the topbar (escaping `.admin-content`'s padding) so the
 * chat input row sits flush with the bottom edge.
 */
export function AiHelpPage() {
  return (
    <div className="ai-help-shell">
      <ChatSessionsSidebar />
      <ChatPanel fullPage />
    </div>
  );
}
