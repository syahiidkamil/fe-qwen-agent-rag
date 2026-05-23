import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

function truncate(s: string, max = 28): string {
  return s.length > max ? `${s.slice(0, max - 2)}…` : s;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`msg ${message.role}`}>
      <div className="bubble">{message.text}</div>
      {message.sources && message.sources.length > 0 && (
        <div className="msg-cite">
          {message.sources.map((s, i) =>
            s.url ? (
              <a
                key={s.id}
                className="cite"
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.name}
              >
                <span className="ix">[{i + 1}]</span> {truncate(s.name)}
              </a>
            ) : (
              <span className="cite" key={s.id}>
                <span className="ix">[{i + 1}]</span> {truncate(s.name)}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}
