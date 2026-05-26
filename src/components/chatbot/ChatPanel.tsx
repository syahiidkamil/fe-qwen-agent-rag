import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { Lock, RotateCcw, Send, X } from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useFilesStore } from "@/stores/useFilesStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { MessageBubble } from "@/components/chatbot/MessageBubble";
import { MarkdownText } from "@/components/chatbot/MarkdownText";
import { TypingIndicator } from "@/components/chatbot/TypingIndicator";

interface ChatPanelProps {
  /** Close handler. Required in popup mode; ignored in full-page mode. */
  onClose?: () => void;
  /** When true: drop the dialog dimensions, hide the close button, and
   *  center the content as a reading column. */
  fullPage?: boolean;
}

export function ChatPanel({ onClose, fullPage = false }: ChatPanelProps) {
  const widget = useConfigStore((s) => s.config.widget);
  const chatMode = useConfigStore((s) => s.config.chat_mode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const messages = useChatStore((s) => s.messages);
  const draft = useChatStore((s) => s.draft);
  const typing = useChatStore((s) => s.typing);
  const setDraft = useChatStore((s) => s.setDraft);
  const send = useChatStore((s) => s.send);
  const reset = useChatStore((s) => s.reset);
  const streaming = useChatStore((s) => s.streaming);
  const gated = useChatStore((s) => s.gated);
  const indexedCount = useFilesStore(
    (s) => s.files.filter((f) => f.status === "ingested").length,
  );

  // Show the "Sign in to chat" card when chat_mode is internal and we're
  // anonymous, OR when a previous send got blocked by the BE 401 gate.
  // Authenticated users (any role) always see the regular input.
  const showGate =
    !isAuthenticated && (gated || chatMode === "internal");

  const bodyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const showSuggestions = messages.length === 1 && !typing;
  const canSend = draft.trim().length > 0 && !typing;
  const canClear = messages.length > 1 && !typing;

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) void send();
    }
  };

  return (
    <div
      className="chat-panel"
      role="dialog"
      aria-label="Chat with assistant"
      data-gated={showGate ? "true" : undefined}
      data-fullpage={fullPage ? "true" : undefined}
    >
      <div className="chat-head">
        <div className="chat-avatar">{widget.initial}</div>
        <div className="chat-head-text">
          <div className="chat-name">{widget.name}</div>
          <div className="chat-status">
            grounded · {indexedCount} sources indexed
          </div>
        </div>
        <button
          type="button"
          className="chat-head-close"
          onClick={reset}
          disabled={!canClear}
          aria-label="Clear chat"
          title="Clear chat"
          style={{ marginRight: 6 }}
        >
          <RotateCcw size={13} strokeWidth={2.2} />
        </button>
        {!fullPage && (
          <button
            type="button"
            className="chat-head-close"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X size={14} strokeWidth={2.2} />
          </button>
        )}
      </div>

      <div
        className="chat-body"
        ref={bodyRef}
        style={showGate && messages.length > 1 ? { opacity: 0.55 } : undefined}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {typing && (
          <div className="msg bot">
            <div className="bubble">
              {streaming ? <MarkdownText text={streaming} /> : <TypingIndicator />}
            </div>
          </div>
        )}
      </div>

      {showGate ? (
        <div
          style={{
            padding: "16px 14px",
            borderTop: "1px solid var(--line)",
            background: "var(--surface-2, #f6f7f8)",
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
              fontSize: 14,
              color: "var(--ink)",
            }}
          >
            <Lock size={14} strokeWidth={2} />
            Sign in to chat
          </div>
          <p
            style={{
              color: "var(--ink-2)",
              fontSize: 13,
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            {widget.name} is currently only available to signed-in team
            members. Sign in to continue the conversation.
          </p>
          <Link
            to="/login"
            className="btn btn-teal"
            style={{
              justifyContent: "center",
              padding: "10px 16px",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Sign in →
          </Link>
        </div>
      ) : (
        <>
          {showSuggestions && widget.suggestions.length > 0 && (
            <div className="chat-suggestions">
              <div className="chat-suggestions-label">Try asking</div>
              {widget.suggestions.slice(0, 4).map((s, i) => (
                <button
                  type="button"
                  key={i}
                  className="suggest"
                  onClick={() => void send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              placeholder={`Ask anything about ${widget.name}…`}
              rows={1}
            />
            <button
              type="button"
              className="chat-send"
              onClick={() => void send()}
              disabled={!canSend}
              aria-label="Send"
            >
              <Send size={14} strokeWidth={2} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
