import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

// Vite serves the worker as a static asset; this points pdf.js at it.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfChunkViewerProps {
  filename: string;
  signedUrl: string;
  chunkContent: string;
  backTo: string;
}

/**
 * PDF.js-backed viewer with chunk highlighting.
 *
 * Strategy: render the PDF, scan each page's text layer (rendered by
 * react-pdf), find the first page whose flat text contains the longest
 * stable phrase from the chunk, jump there, and wrap matching spans in
 * <mark>. The chunk's text is a moving target (line breaks differ,
 * ligatures, hyphenation), so we search using shorter overlapping
 * n-grams rather than the whole chunk.
 */
export function PdfChunkViewer({
  filename,
  signedUrl,
  chunkContent,
  backTo,
}: PdfChunkViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [highlightPage, setHighlightPage] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Long phrases from the chunk — used to *find* the right page in the
   *  flat text content (pdf.js gives us one big string per page). */
  const phrases = useMemo(() => chunkPhrases(chunkContent), [chunkContent]);
  /** Short anchors from the chunk — used to *mark* individual spans.
   *  pdf.js splits text into per-line (or even per-word) spans, so the
   *  long phrases never match a single span. We need shorter,
   *  case-folded tokens that fit inside a single rendered fragment. */
  const anchors = useMemo(() => chunkAnchors(chunkContent), [chunkContent]);

  // Scan all pages once the document loads, picking the first page that
  // contains the strongest phrase match. Done on the pdfjs document
  // instance (not React's DOM) so we don't depend on render order.
  const onLoad = async (doc: { numPages: number; getPage: (n: number) => Promise<unknown> }) => {
    setNumPages(doc.numPages);
    for (let p = 1; p <= doc.numPages; p++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfPage: any = await doc.getPage(p);
      const textContent = await pdfPage.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flat = (textContent.items as any[])
        .map((it) => ("str" in it ? it.str : ""))
        .join(" ");
      const flatLower = flat.toLowerCase();
      if (phrases.some((ph) => flatLower.includes(ph))) {
        setPage(p);
        setHighlightPage(p);
        return;
      }
    }
    // No phrase matched anywhere — show page 1, no highlight.
    setHighlightPage(null);
  };

  // After each page renders, walk the text layer and wrap matching
  // tokens in <mark>. react-pdf populates the text layer async after
  // the canvas paints, so we poll on a short interval until we either
  // mark something or hit the cap (then give up — the chunk may have
  // landed on a page that doesn't render its text via the text layer).
  useEffect(() => {
    if (highlightPage === null || highlightPage !== page) return;
    const root = containerRef.current;
    if (!root) return;

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 30; // 30 * 100ms = 3s ceiling

    const tick = () => {
      if (cancelled) return;
      attempts += 1;
      const layer = root.querySelector(".react-pdf__Page__textContent");
      const spans = layer ? layer.querySelectorAll<HTMLElement>("span") : [];

      if (spans.length === 0) {
        if (attempts < MAX_ATTEMPTS) window.setTimeout(tick, 100);
        return;
      }

      let first: HTMLElement | null = null;
      spans.forEach((span) => {
        const txt = (span.textContent ?? "").toLowerCase();
        if (!txt.trim()) return;
        if (anchors.some((a) => txt.includes(a))) {
          span.classList.add("doc-viewer-pdf-highlight");
          if (!first) first = span;
        }
      });

      if (first) {
        (first as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }
      // Spans exist but none matched yet — could be a stale layer mid-
      // replace. Try a couple more ticks before giving up.
      if (attempts < MAX_ATTEMPTS) window.setTimeout(tick, 100);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [highlightPage, page, anchors]);

  return (
    <div className="doc-viewer doc-viewer-pdf">
      <div className="doc-viewer-head">
        <Link to={backTo} className="doc-viewer-back">
          ← Back to knowledge base
        </Link>
        <div className="doc-viewer-filename">{filename}</div>
        <a
          className="btn btn-ghost btn-sm"
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={14} strokeWidth={1.8} />
          Open original
        </a>
      </div>

      <div className="doc-viewer-pages" ref={containerRef}>
        <Document
          file={signedUrl}
          onLoadSuccess={onLoad}
          loading={<div className="doc-viewer-loading">Loading document…</div>}
          error={
            <div className="doc-viewer-loading">
              Couldn't render this PDF inline.{" "}
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--teal-deep)" }}
              >
                Open the original
              </a>
              .
            </div>
          }
        >
          <Page pageNumber={page} width={Math.min(900, window.innerWidth - 96)} />
        </Document>
      </div>

      {numPages > 1 && (
        <div className="doc-viewer-pager">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} strokeWidth={1.8} />
          </button>
          <span className="doc-viewer-pager-label">
            Page {page} of {numPages}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page >= numPages}
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight size={14} strokeWidth={1.8} />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Decompose a chunk into long, page-level search phrases. We lowercase
 * and collapse whitespace so line-break / hyphenation differences
 * between the chunk and the PDF text layer don't kill the match.
 */
function chunkPhrases(chunkContent: string): string[] {
  const cleaned = clean(chunkContent);
  if (!cleaned) return [];
  const sentences = cleaned.split(/[.!?]\s+/).filter((s) => s.length >= 20);
  const candidates: string[] = [];
  for (const s of sentences) {
    candidates.push(s.slice(0, 120));
    candidates.push(s.slice(0, 60));
  }
  // Fallback: first 120/60 chars of the whole chunk if no sentence boundary.
  candidates.push(cleaned.slice(0, 120));
  candidates.push(cleaned.slice(0, 60));
  return Array.from(new Set(candidates.filter((p) => p.length >= 20))).sort(
    (a, b) => b.length - a.length,
  );
}

/**
 * Short anchors that fit inside a single rendered PDF text span. pdf.js
 * typically emits one span per text run (often a single line), so a
 * 20–40 char snippet is a sweet spot — long enough to be unique to the
 * chunk, short enough to land inside one span.
 *
 * We harvest the first ~3 distinctive sentences of the chunk and slice
 * to several lengths, picking the longest match wins via length-desc
 * sort. Filter out short, common words ("the", "and") to keep noise low.
 */
function chunkAnchors(chunkContent: string): string[] {
  const cleaned = clean(chunkContent);
  if (!cleaned) return [];
  // Strip the leading "[page: N]" marker added by ingestion.
  const stripped = cleaned.replace(/^\[page:\s*\d+\]\s*/i, "");
  const sentences = stripped
    .split(/[.!?]\s+/)
    .filter((s) => s.length >= 15)
    .slice(0, 4);

  const out = new Set<string>();
  const push = (s: string) => {
    const trimmed = s.trim();
    if (trimmed.length >= 12 && trimmed.length <= 60) out.add(trimmed);
  };

  for (const s of sentences) {
    push(s.slice(0, 60));
    push(s.slice(0, 40));
    push(s.slice(0, 25));
  }
  return [...out].sort((a, b) => b.length - a.length);
}

function clean(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().toLowerCase();
}
