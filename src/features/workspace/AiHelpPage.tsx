import { useState } from "react";

import { ChatPanel } from "@/components/chatbot/ChatPanel";
import { ChatSessionsSidebar } from "@/features/workspace/ChatSessionsSidebar";

/**
 * Full-page AI Help surface: a per-user session list on the left and the
 * full-page ChatPanel on the right. The `.ai-help-shell` wrapper fills the
 * viewport below the topbar (escaping `.admin-content`'s padding) so the
 * chat input row sits flush with the bottom edge.
 *
 * On phones (≤768px) the session list becomes an off-canvas drawer toggled
 * from the chat head; the scrim closes it on tap.
 */
export function AiHelpPage() {
  const [sessionsOpen, setSessionsOpen] = useState(false);

  return (
    <div className="ai-help-shell">
      <ChatSessionsSidebar open={sessionsOpen} onClose={() => setSessionsOpen(false)} />
      {sessionsOpen && (
        <div className="chat-sessions-scrim" onClick={() => setSessionsOpen(false)} />
      )}
      <ChatPanel fullPage onToggleSessions={() => setSessionsOpen((v) => !v)} />
    </div>
  );
}
