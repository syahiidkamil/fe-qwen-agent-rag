export interface ChatSource {
  id: string;
  name: string;
  url?: string;
  /** Cosine similarity (0–1) of the top chunk to the question. Surfaced only in
   *  admin Debug Mode to calibrate the relevance threshold. */
  similarity?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  sources?: ChatSource[];
  /** Epoch ms when the message was created. Required so the compiler flags
   *  every construction site; render with formatMessageTime(). */
  createdAt: number;
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
