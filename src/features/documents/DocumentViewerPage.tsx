import { Suspense, lazy, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { DocumentService } from "@/services/DocumentService";
import type { KbFile } from "@/types/file";
import { InlineChunkViewer } from "@/features/documents/InlineChunkViewer";

// react-pdf + pdfjs-dist are large; only load when a PDF actually opens.
const PdfChunkViewer = lazy(() =>
  import("@/features/documents/PdfChunkViewer").then((m) => ({
    default: m.PdfChunkViewer,
  })),
);

interface ChunkPayload {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
}

/**
 * Renders the document viewer for both /admin/document/:id and
 * /workspace/document/:id. Reads ?chunk= from the URL so the deep-link
 * survives reload, then dispatches to the PDF viewer or the inline
 * fallback based on the document's MIME type.
 */
export function DocumentViewerPage() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const chunkId = params.get("chunk");
  const location = useLocation();
  const navigate = useNavigate();

  const [doc, setDoc] = useState<KbFile | null>(null);
  const [chunk, setChunk] = useState<ChunkPayload | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const backTo = location.pathname.startsWith("/admin")
    ? "/admin/knowledge"
    : "/workspace/knowledge";

  useEffect(() => {
    if (!id || !chunkId) {
      setErr("Missing document or chunk id");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [d, c, url] = await Promise.all([
          DocumentService.getOne(id),
          DocumentService.getChunk(id, chunkId),
          DocumentService.getViewUrl(id).catch(() => null),
        ]);
        if (cancelled) return;
        setDoc(d);
        setChunk(c);
        setSignedUrl(url);
      } catch (e) {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : "Failed to load document");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, chunkId]);

  if (err) {
    return (
      <div className="doc-viewer">
        <div className="doc-viewer-head">
          <button
            type="button"
            className="doc-viewer-back"
            onClick={() => navigate(backTo)}
          >
            ← Back to knowledge base
          </button>
        </div>
        <div className="doc-viewer-loading">{err}</div>
      </div>
    );
  }

  if (!doc || !chunk) {
    return (
      <div className="doc-viewer">
        <div className="doc-viewer-loading">Loading document…</div>
      </div>
    );
  }

  const isPdf =
    doc.type === "pdf" ||
    (typeof signedUrl === "string" && signedUrl.includes(".pdf"));

  if (isPdf && signedUrl) {
    return (
      <Suspense
        fallback={<div className="doc-viewer-loading">Loading PDF viewer…</div>}
      >
        <PdfChunkViewer
          filename={doc.name}
          signedUrl={signedUrl}
          chunkContent={chunk.content}
          backTo={backTo}
        />
      </Suspense>
    );
  }

  return (
    <InlineChunkViewer
      filename={doc.name}
      tags={doc.tags}
      chunkContent={chunk.content}
      signedUrl={signedUrl}
      backTo={backTo}
    />
  );
}
