import type { SourceRef } from "@/services/ChatService";
import type { ChatSource } from "@/types/chat";

/**
 * Collapse backend retrieval refs into the UI's source chips.
 *
 * Dedupes by document_id (a single doc can supply several chunks) and
 * prefers the real filename when the backend provided one. Shared by the
 * live chat store and the session loader so replayed history renders source
 * chips identically to freshly-streamed answers.
 */
export function sourcesToChat(refs: SourceRef[]): ChatSource[] {
  const seen = new Set<string>();
  const out: ChatSource[] = [];
  for (const r of refs) {
    if (seen.has(r.document_id)) continue;
    seen.add(r.document_id);
    out.push({
      id: r.document_id,
      name: r.filename || `doc-${r.document_id.slice(0, 6)}`,
      url: r.url ?? undefined,
    });
  }
  return out;
}
