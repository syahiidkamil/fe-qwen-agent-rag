import { MarkdownText } from "@/components/chatbot/MarkdownText";
import { formatMessageTime } from "@/lib/format";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDebugStore } from "@/stores/useDebugStore";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

function truncate(s: string, max = 28): string {
  return s.length > max ? `${s.slice(0, max - 2)}…` : s;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const role = useAuthStore((s) => s.role);
  const debugMode = useDebugStore((s) => s.debugMode);
  // Belt-and-suspenders: only admins see debug info, even if a non-admin has a
  // stale "debugMode: true" left in localStorage from a previous admin session.
  const isAdmin = role === "admin" || role === "super_admin";
  const showDebug = isAdmin && debugMode;

  return (
    <div className={`msg ${message.role}`}>
      <div className="bubble">
        {message.role === "bot" ? (
          <MarkdownText text={message.text} />
        ) : (
          message.text
        )}
      </div>
      {message.images && message.images.length > 0 && (
        <div className="msg-images">
          {message.images.map((src, i) => (
            <a
              key={src}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              title="Open source page"
            >
              <img src={src} alt={`Source page ${i + 1}`} loading="lazy" />
            </a>
          ))}
        </div>
      )}
      {message.sources && message.sources.length > 0 && (
        <div className="msg-cite">
          {message.sources.map((s, i) => {
            const label = (
              <>
                <span className="ix">[{i + 1}]</span> {truncate(s.name)}
                {showDebug &&
                  (typeof s.score === "number" || typeof s.similarity === "number") && (
                    <span className="msg-time" style={{ marginLeft: 4 }}>
                      {typeof s.score === "number" && (
                        <span title="Reciprocal Rank Fusion score — drives ranking">
                          rrf {s.score.toFixed(4)}
                        </span>
                      )}
                      {typeof s.score === "number" &&
                        typeof s.similarity === "number" && (
                          <span style={{ opacity: 0.5 }}> · </span>
                        )}
                      {typeof s.similarity === "number" && (
                        <span title="Cosine similarity to your question (0–1) — the relevance gate">
                          sim {s.similarity.toFixed(2)}
                        </span>
                      )}
                    </span>
                  )}
              </>
            );
            return s.url ? (
              <a
                key={s.id}
                className="cite"
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.name}
              >
                {label}
              </a>
            ) : (
              <span className="cite" key={s.id}>
                {label}
              </span>
            );
          })}
        </div>
      )}
      <div className="msg-time">{formatMessageTime(message.createdAt, showDebug)}</div>
    </div>
  );
}
