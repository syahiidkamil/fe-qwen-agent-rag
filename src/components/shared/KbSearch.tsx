import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { Search, Loader2 } from "lucide-react";

import { SearchService, type SearchHit } from "@/services/SearchService";

/**
 * Hybrid knowledge-base search. Debounces the query (300ms), calls
 * /api/documents/search, and renders a keyboard-navigable list of
 * matching chunks. The same component powers both /admin/knowledge
 * and /workspace/knowledge — the `placement` prop only changes
 * where a selected chunk routes the user.
 *
 * Server-side already runs hybrid vector + FTS via RRF (see
 * services/retrieval.retrieve), and the embedder caches normalized
 * queries in-process, so we can afford keystroke-level debouncing.
 */
interface KbSearchProps {
  placement: "admin" | "user";
}

const DEBOUNCE_MS = 300;
const SNIPPET_LEN = 240;

export function KbSearch({ placement }: KbSearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce: trailing-edge, 300ms.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(draft), DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [draft]);

  // Fire the search whenever the debounced query changes.
  useEffect(() => {
    let cancelled = false;
    const q = debouncedQuery.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    void SearchService.search(q)
      .then((hits) => {
        if (cancelled) return;
        setResults(hits);
        setHighlighted(hits.length > 0 ? 0 : -1);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close the dropdown on outside-click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const queryTokens = useMemo(() => tokenize(debouncedQuery), [debouncedQuery]);

  const openHit = (hit: SearchHit) => {
    const base = placement === "admin" ? "/admin/document" : "/workspace/document";
    navigate(`${base}/${hit.documentId}?chunk=${hit.chunkId}`);
    setOpen(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    setOpen(true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      setOpen(true);
      setHighlighted((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length > 0) {
      e.preventDefault();
      setOpen(true);
      setHighlighted((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      const target = results[highlighted];
      if (target) {
        e.preventDefault();
        openHit(target);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown =
    open &&
    debouncedQuery.trim().length > 0 &&
    (loading || results.length > 0 || error !== null);

  return (
    <div className="kb-search" ref={containerRef}>
      <div className="kb-search-input-wrap">
        <Search size={16} strokeWidth={1.8} className="kb-search-icon" />
        <input
          ref={inputRef}
          type="search"
          className="kb-search-input"
          placeholder="Search the knowledge base…"
          value={draft}
          onChange={onChange}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Search the knowledge base"
        />
        {loading && (
          <Loader2
            size={14}
            strokeWidth={2}
            className="kb-search-spinner"
            aria-hidden="true"
          />
        )}
      </div>

      {showDropdown && (
        <div className="kb-search-results" role="listbox">
          {error ? (
            <div className="kb-search-empty">{error}</div>
          ) : results.length === 0 && !loading ? (
            <div className="kb-search-empty">no matches in the corpus</div>
          ) : (
            results.map((hit, i) => (
              <button
                key={hit.chunkId}
                type="button"
                role="option"
                aria-selected={i === highlighted}
                data-highlighted={i === highlighted ? "true" : undefined}
                className="kb-search-result"
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => openHit(hit)}
              >
                <div className="kb-search-result-head">
                  <span className="kb-search-result-filename">
                    {hit.document.filename}
                  </span>
                  {hit.document.tags.length > 0 && (
                    <span className="kb-search-result-tags">
                      {hit.document.tags.slice(0, 4).map((t) => (
                        <span key={t} className="kb-search-result-tag">
                          {t}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <div className="kb-search-snippet">
                  {highlightTokens(snip(hit.content), queryTokens)}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function snip(s: string): string {
  if (s.length <= SNIPPET_LEN) return s;
  return s.slice(0, SNIPPET_LEN).trimEnd() + "…";
}

function tokenize(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2),
    ),
  );
}

/**
 * Wrap each occurrence of any query token in <mark>. Case-insensitive,
 * substring; long-tokens-first so "scholarship" wins over "scholar".
 */
function highlightTokens(label: string, tokens: string[]): ReactNode {
  if (tokens.length === 0) return label;
  const sorted = [...tokens].sort((a, b) => b.length - a.length);
  const lowered = new Set(sorted.map((t) => t.toLowerCase()));
  const escaped = sorted
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const re = new RegExp(`(${escaped})`, "ig");
  // `split` with a capturing group keeps the delimiters in the array;
  // every other element is a match. Don't re-evaluate the global regex
  // (its `lastIndex` advances and breaks subsequent tests).
  const parts = label.split(re);
  return (
    <>
      {parts.map((part, i) =>
        lowered.has(part.toLowerCase()) ? (
          <mark key={i} className="kb-search-mark">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
