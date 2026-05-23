import { useEffect, useRef } from "react";
import { RotateCcw, Send, X } from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useFilesStore } from "@/stores/useFilesStore";
import { MessageBubble } from "@/components/chatbot/MessageBubble";
import { MarkdownText } from "@/components/chatbot/MarkdownText";
import { TypingIndicator } from "@/components/chatbot/TypingIndicator";

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const widget = useConfigStore((s) => s.config.widget);
  const messages = useChatStore((s) => s.messages);
  const draft = useChatStore((s) => s.draft);
  const typing = useChatStore((s) => s.typing);
  const setDraft = useChatStore((s) => s.setDraft);
  const send = useChatStore((s) => s.send);
  const reset = useChatStore((s) => s.reset);
  const streaming = useChatStore((s) => s.streaming);
  const indexedCount = useFilesStore(
    (s) => s.files.filter((f) => f.status === "ingested").length,
  );

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
    <div className="chat-panel" role="dialog" aria-label="Chat with assistant">
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
        <button
          type="button"
          className="chat-head-close"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X size={14} strokeWidth={2.2} />
        </button>
      </div>

      <div className="chat-body" ref={bodyRef}>
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
    </div>
  );
}
