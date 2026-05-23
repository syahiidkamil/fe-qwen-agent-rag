import { STREAM_URL } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export interface ChatStreamMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SourceRef {
  chunk_id: string;
  document_id: string;
  score: number;
}

export interface StreamCallbacks {
  onSession?: (sessionId: string) => void;
  onSources?: (sources: SourceRef[]) => void;
  onToken: (delta: string) => void;
  onDone: (full: string) => void;
  onError: (err: Error) => void;
}

/**
 * Streams a chat completion from the FastAPI backend's SSE endpoint.
 *
 * Uses fetch + ReadableStream (NOT axios) because axios doesn't expose
 * streamed response bodies. Parses the SSE wire format manually:
 *   `data: <json>\n\n` per event, `data: [DONE]\n\n` terminates.
 */
export async function streamChat(
  messages: ChatStreamMessage[],
  sessionId: string | null,
  cb: StreamCallbacks,
): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const resp = await fetch(STREAM_URL("/api/chat"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ messages, session_id: sessionId }),
  });

  if (!resp.ok || !resp.body) {
    cb.onError(new Error(`HTTP ${resp.status}: ${await resp.text().catch(() => "")}`));
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nlnl: number;
    while ((nlnl = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, nlnl);
      buffer = buffer.slice(nlnl + 2);
      const line = raw.trimStart();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") {
        cb.onDone(full);
        return;
      }
      try {
        const ev = JSON.parse(payload);
        if (ev.type === "session" && ev.session_id) cb.onSession?.(ev.session_id);
        else if (ev.type === "sources") cb.onSources?.(ev.sources ?? []);
        else if (ev.type === "token" && ev.delta) {
          full += ev.delta;
          cb.onToken(ev.delta);
        } else if (ev.type === "done") {
          full = ev.full_text ?? full;
        }
      } catch (err) {
        cb.onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }
  // Stream ended without explicit [DONE]
  cb.onDone(full);
}
