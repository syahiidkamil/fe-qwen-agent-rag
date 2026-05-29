export interface ChatSource {
  id: string;
  name: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  sources?: ChatSource[];
}

/** A persisted, per-user chat session as shown in the AI Help sidebar. */
export interface ChatSession {
  id: string;
  title: string;
  /** ISO timestamp — when the session was created. */
  startedAt: string;
  /** ISO timestamp — last activity, used to order the sidebar list. */
  lastMessageAt: string;
}
