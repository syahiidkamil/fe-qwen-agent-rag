import { Link } from "react-router";
import { ExternalLink } from "lucide-react";

interface InlineChunkViewerProps {
  filename: string;
  tags: string[];
  chunkContent: string;
  signedUrl: string | null;
  backTo: string;
}

/**
 * Non-PDF fallback for the document viewer. We can't reliably render
 * arbitrary mime types inline, so we surface the matched chunk in a
 * readable card and offer "Open original" — which still routes to the
 * same signed URL the PDF path uses.
 */
export function InlineChunkViewer({
  filename,
  tags,
  chunkContent,
  signedUrl,
  backTo,
}: InlineChunkViewerProps) {
  return (
    <div className="doc-viewer">
      <div className="doc-viewer-head">
        <Link to={backTo} className="doc-viewer-back">
          ← Back to knowledge base
        </Link>
      </div>
      <div className="doc-viewer-card">
        <div className="doc-viewer-filename">{filename}</div>
        {tags.length > 0 && (
          <div className="doc-viewer-tags">
            {tags.map((t) => (
              <span key={t} className="tag-chip">
                {t}
              </span>
            ))}
          </div>
        )}
        <blockquote className="doc-viewer-chunk">{chunkContent}</blockquote>
        {signedUrl && (
          <a
            className="btn btn-teal btn-sm doc-viewer-open"
            href={signedUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={14} strokeWidth={1.8} />
            Open original
          </a>
        )}
      </div>
    </div>
  );
}
