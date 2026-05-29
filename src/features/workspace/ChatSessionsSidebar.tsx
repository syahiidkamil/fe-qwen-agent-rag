import { useEffect, useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useChatStore } from "@/stores/useChatStore";
import { relativeTimeFromNow } from "@/lib/format";
import type { ChatSession } from "@/types/chat";

interface SessionRowProps {
  session: ChatSession;
  active: boolean;
  onOpen: () => void;
  onRename: (title: string) => Promise<void>;
  onDelete: () => void;
}

/**
 * One row in the session list. Owns its own inline-rename state so editing
 * one title never re-renders or disturbs the others.
 */
function SessionRow({ session, active, onOpen, onRename, onDelete }: SessionRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(session.title);
  // Distinguishes an Escape-cancel from a normal commit: both routes blur the
  // input, and the single onBlur handler is what actually saves.
  const cancelRef = useRef(false);

  const startEdit = () => {
    setDraft(session.title);
    cancelRef.current = false;
    setEditing(true);
  };

  const commit = async () => {
    if (!editing) return;
    setEditing(false);
    if (cancelRef.current) return;
    const next = draft.trim();
    if (!next || next === session.title) return;
    try {
      await onRename(next);
    } catch {
      // Rename failed (network/validation) — the list keeps the old title.
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur(); // -> onBlur commits
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelRef.current = true;
      e.currentTarget.blur();
    }
  };

  if (editing) {
    return (
      <div className="chat-session-row" data-active={active || undefined}>
        <input
          className="chat-session-edit"
          value={draft}
          autoFocus
          maxLength={120}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={commit}
          onKeyDown={onKeyDown}
          aria-label="Conversation title"
        />
      </div>
    );
  }

  return (
    <div className="chat-session-row" data-active={active || undefined}>
      <button
        type="button"
        className="chat-session-main"
        onClick={onOpen}
        title={session.title}
      >
        <span className="chat-session-title">{session.title}</span>
        <span className="chat-session-time">
          {relativeTimeFromNow(new Date(session.lastMessageAt).getTime())}
        </span>
      </button>
      <div className="chat-session-actions">
        <button
          type="button"
          className="chat-session-act"
          onClick={startEdit}
          aria-label="Rename conversation"
          title="Rename"
        >
          <Pencil size={13} strokeWidth={1.9} />
        </button>
        <button
          type="button"
          className="chat-session-act"
          data-danger="true"
          onClick={() => {
            if (confirm("Delete this conversation? This can't be undone.")) onDelete();
          }}
          aria-label="Delete conversation"
          title="Delete"
        >
          <Trash2 size={13} strokeWidth={1.9} />
        </button>
      </div>
    </div>
  );
}

/**
 * Per-user chat-session list for the AI Help page. Lists the signed-in
 * user's saved conversations, lets them start a new one, reopen a past one,
 * and rename/delete. Rendered only on the full-page AI Help surface — the
 * floating landing widget stays session-less.
 */
export function ChatSessionsSidebar() {
  const sessions = useChatStore((s) => s.sessions);
  const loading = useChatStore((s) => s.sessionsLoading);
  const activeId = useChatStore((s) => s.sessionId);
  const loadSessions = useChatStore((s) => s.loadSessions);
  const openSession = useChatStore((s) => s.openSession);
  const renameSession = useChatStore((s) => s.renameSession);
  const deleteSession = useChatStore((s) => s.deleteSession);
  const reset = useChatStore((s) => s.reset);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  return (
    <aside className="chat-sessions" aria-label="Chat sessions">
      <div className="chat-sessions-head">
        <button type="button" className="chat-sessions-new" onClick={reset}>
          <Plus size={15} strokeWidth={2} />
          <span>New chat</span>
        </button>
      </div>
      <div className="chat-sessions-list">
        {sessions.length === 0 ? (
          <div className="chat-sessions-empty">
            {loading
              ? "Loading…"
              : "No conversations yet. Start chatting and your history shows up here."}
          </div>
        ) : (
          sessions.map((s) => (
            <SessionRow
              key={s.id}
              session={s}
              active={s.id === activeId}
              onOpen={() => void openSession(s.id)}
              onRename={(title) => renameSession(s.id, title)}
              onDelete={() => void deleteSession(s.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
