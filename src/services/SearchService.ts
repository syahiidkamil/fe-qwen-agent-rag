import { api } from "@/lib/api";
import type { KbFileStatus } from "@/types/file";

export interface SearchHit {
  chunkId: string;
  documentId: string;
  content: string;
  score: number;
  document: {
    id: string;
    filename: string;
    mimeType: string | null;
    status: KbFileStatus;
    tags: string[];
  };
}

interface BackendSearchHit {
  chunk_id: string;
  document_id: string;
  content: string;
  score: number;
  document: {
    id: string;
    filename: string;
    mime_type: string | null;
    status: KbFileStatus;
    tags: string[];
  };
}

function toHit(h: BackendSearchHit): SearchHit {
  return {
    chunkId: h.chunk_id,
    documentId: h.document_id,
    content: h.content,
    score: h.score,
    document: {
      id: h.document.id,
      filename: h.document.filename,
      mimeType: h.document.mime_type,
      status: h.document.status,
      tags: Array.isArray(h.document.tags) ? h.document.tags : [],
    },
  };
}

export const SearchService = {
  /** Hybrid corpus search. Empty query short-circuits server-side. */
  async search(query: string, topK = 8): Promise<SearchHit[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const { data } = await api.post<{ data: BackendSearchHit[] }>(
      "/api/documents/search",
      { query: trimmed, top_k: topK },
    );
    return data.data.map(toHit);
  },
};
