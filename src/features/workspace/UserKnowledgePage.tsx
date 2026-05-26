import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import Fuse from "fuse.js";

import { useFilesStore } from "@/stores/useFilesStore";
import { FileIcon } from "@/components/shared/FileIcon";
import { fmtBytes } from "@/lib/format";
import { DocumentService } from "@/services/DocumentService";
import { toast } from "sonner";

async function openDocument(id: string, name: string) {
  // Open the tab synchronously so popup blockers treat it as user-initiated.
  const tab = window.open("about:blank", "_blank", "noopener");
  try {
    const url = await DocumentService.getViewUrl(id);
    if (tab) tab.location.href = url;
    else window.open(url, "_blank", "noopener");
  } catch (err) {
    if (tab) tab.close();
    const msg = err instanceof Error ? err.message : `Could not open ${name}`;
    toast.error(msg);
  }
}

/**
 * Read-only knowledge-base browser for the user role.
 *
 * Filter UX: active filters render as removable chips next to a free-form
 * input — typing then pressing space, comma, or Enter commits the token
 * as an active filter chip. When the user is typing, a "matches" row
 * below shows corpus tags whose name contains the current draft (case-
 * insensitive); arrow keys highlight, Enter on a highlighted match
 * commits it, Enter without a highlight commits the raw text. When the
 * draft is empty, the bottom row instead shows all available corpus tags
 * capped at MAX_VISIBLE with a "+N more" toggle so the bar never
 * overwhelms the page. Filter is OR + case-folded across active chips.
 */
const MAX_VISIBLE_AVAILABLE = 12;
const MAX_VISIBLE_SUGGESTIONS = 12;

// Fuse threshold: 0.0 = exact, 1.0 = match anything. Tags are short, so
// 0.4 lets a one-character typo through ("cohrt" → "cohort") without
// becoming too noisy.
const FUSE_OPTIONS = {
  threshold: 0.4,
  ignoreLocation: true,
  includeMatches: true,
  minMatchCharLength: 1,
} as const;

type SuggestionResult = {
  tag: string;
  indices: ReadonlyArray<readonly [number, number]>;
};

/**
 * Wrap each matched character range in `<mark>` so the user can see why
 * a suggestion was returned. Fuse may return multiple non-contiguous
 * ranges per result, so we sort + walk them in one pass.
 */
function highlightFuzzy(
  label: string,
  indices: ReadonlyArray<readonly [number, number]>,
): ReactNode {
  if (!indices || indices.length === 0) return label;
  const sorted = [...indices].sort((a, b) => a[0] - b[0]);
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of sorted) {
    if (start > cursor) parts.push(label.slice(cursor, start));
    parts.push(
      <mark key={`m${start}`} className="tag-filter-match">
        {label.slice(start, end + 1)}
      </mark>,
    );
    cursor = end + 1;
  }
  if (cursor < label.length) parts.push(label.slice(cursor));
  return <>{parts}</>;
}

export function UserKnowledgePage() {
  const files = useFilesStore((s) => s.files);
  const loading = useFilesStore((s) => s.loading);
  const refresh = useFilesStore((s) => s.refresh);

  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visibleCorpus = useMemo(
    () => files.filter((f) => f.status === "ingested"),
    [files],
  );

  const corpusTags = useMemo(() => {
    const set = new Set<string>();
    for (const f of visibleCorpus) for (const t of f.tags) set.add(t);
    return [...set].sort();
  }, [visibleCorpus]);

  const filteredFiles = useMemo(() => {
    if (activeFilters.size === 0) return visibleCorpus;
    const lower = new Set([...activeFilters].map((t) => t.toLowerCase()));
    return visibleCorpus.filter((f) =>
      f.tags.some((t) => lower.has(t.toLowerCase())),
    );
  }, [visibleCorpus, activeFilters]);

  const addFilters = (raws: string[]) => {
    const cleaned = raws
      .map((r) => r.trim().toLowerCase())
      .filter(Boolean);
    if (cleaned.length === 0) return;
    setActiveFilters((prev) => {
      const next = new Set(prev);
      for (const t of cleaned) next.add(t);
      return next;
    });
  };

  const addFilter = (raw: string) => {
    addFilters([raw]);
    setDraft("");
  };

  const removeFilter = (tag: string) => {
    setActiveFilters((prev) => {
      if (!prev.has(tag)) return prev;
      const next = new Set(prev);
      next.delete(tag);
      return next;
    });
  };

  const toggleFilter = (tag: string) => {
    const lower = tag.trim().toLowerCase();
    if (!lower) return;
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(lower)) next.delete(lower);
      else next.add(lower);
      return next;
    });
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // Space/comma act as separators. Split into tokens; everything before
    // the trailing token commits as chips. The trailing token stays in the
    // input only if the value does NOT end with a separator (mid-typing).
    if (/[, ]/.test(v)) {
      const endsWithSep = /[, ]$/.test(v);
      const tokens = v.split(/[, ]+/).filter(Boolean);
      if (endsWithSep) {
        addFilters(tokens);
        setDraft("");
      } else if (tokens.length > 1) {
        const trailing = tokens.pop() ?? "";
        addFilters(tokens);
        setDraft(trailing);
      } else {
        setDraft(v);
      }
      return;
    }
    setDraft(v);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) =>
          i < 0 ? 0 : (i + 1) % suggestions.length,
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) =>
          i <= 0 ? suggestions.length - 1 : i - 1,
        );
        return;
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        addFilter(suggestions[highlightedIndex].tag);
      } else if (draft.trim()) {
        addFilter(draft);
      }
      return;
    }
    if (e.key === "Escape") {
      if (draft) setDraft("");
      return;
    }
    if (e.key === "Backspace" && draft === "" && activeFilters.size > 0) {
      // Empty-field backspace removes the most recent chip.
      const last = [...activeFilters].pop();
      if (last) removeFilter(last);
    }
  };

  const availableTags = useMemo(
    () => corpusTags.filter((t) => !activeFilters.has(t.toLowerCase())),
    [corpusTags, activeFilters],
  );

  const trimmedDraft = draft.trim().toLowerCase();
  const fuse = useMemo(
    () => new Fuse(availableTags, FUSE_OPTIONS),
    [availableTags],
  );
  const suggestions = useMemo<SuggestionResult[]>(() => {
    if (!trimmedDraft) return [];
    return fuse
      .search(trimmedDraft)
      .slice(0, MAX_VISIBLE_SUGGESTIONS)
      .map((r) => ({
        tag: r.item,
        indices: r.matches?.[0]?.indices ?? [],
      }));
  }, [fuse, trimmedDraft]);

  // Reset / clamp the highlight when the visible suggestions change.
  useEffect(() => {
    setHighlightedIndex((prev) => {
      if (suggestions.length === 0) return -1;
      if (prev < 0 || prev >= suggestions.length) return -1;
      return prev;
    });
  }, [suggestions]);

  const visibleAvailable = expanded
    ? availableTags
    : availableTags.slice(0, MAX_VISIBLE_AVAILABLE);
  const overflowCount = availableTags.length - MAX_VISIBLE_AVAILABLE;

  const activeList = useMemo(
    () => [...activeFilters].sort(),
    [activeFilters],
  );

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Knowledge base</span>
          <h1 className="page-title">What Aira can read for you</h1>
        </div>
      </div>

      <div className="tag-filter-bar">
        <div className="tag-filter-row">
          <span className="tag-filter-label">Filter by tag</span>
          {activeList.map((t) => (
            <span key={t} className="tag-filter-chip" data-active="true">
              {t}
              <button
                type="button"
                className="tag-filter-chip-x"
                onClick={() => removeFilter(t)}
                aria-label={`Remove filter ${t}`}
                title={`Remove filter ${t}`}
              >
                <X size={11} strokeWidth={2.4} />
              </button>
            </span>
          ))}
          <input
            type="text"
            className="tag-filter-input"
            value={draft}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            placeholder={
              activeFilters.size === 0
                ? "type a tag, press space or comma…"
                : "add another…"
            }
            aria-label="Add tag filter"
          />
          {activeFilters.size > 0 && (
            <button
              type="button"
              className="tag-filter-clear"
              onClick={() => setActiveFilters(new Set())}
            >
              clear ({activeFilters.size})
            </button>
          )}
        </div>
        {trimmedDraft ? (
          <div className="tag-filter-available" role="listbox" aria-label="Tag suggestions">
            <span className="tag-filter-available-label">matches</span>
            {suggestions.length === 0 ? (
              <span className="tag-filter-no-match">
                no matching tag · press Enter to add “{trimmedDraft}” as-is
              </span>
            ) : (
              suggestions.map((s, i) => (
                <button
                  key={s.tag}
                  type="button"
                  role="option"
                  aria-selected={i === highlightedIndex}
                  className="tag-filter-chip"
                  data-highlighted={i === highlightedIndex ? "true" : undefined}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onClick={() => addFilter(s.tag)}
                  title={`Filter by "${s.tag}"`}
                >
                  {highlightFuzzy(s.tag, s.indices)}
                </button>
              ))
            )}
          </div>
        ) : (
          availableTags.length > 0 && (
            <div className="tag-filter-available">
              <span className="tag-filter-available-label">available</span>
              {visibleAvailable.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="tag-filter-chip"
                  onClick={() => addFilter(t)}
                  title={`Filter by "${t}"`}
                >
                  {t}
                </button>
              ))}
              {overflowCount > 0 && (
                <button
                  type="button"
                  className="tag-filter-more"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? "show less" : `+${overflowCount} more`}
                </button>
              )}
            </div>
          )
        )}
      </div>

      <div className="table-wrap">
        {loading && visibleCorpus.length === 0 ? (
          <div className="kb-empty">Loading documents…</div>
        ) : filteredFiles.length === 0 ? (
          <div className="kb-empty">
            {activeFilters.size === 0
              ? "No documents indexed yet."
              : "Nothing matches that filter."}
          </div>
        ) : (
          <table className="kb-table">
            <thead>
              <tr>
                <th style={{ width: "45%" }}>File</th>
                <th>Tags</th>
                <th>Indexed</th>
                <th style={{ textAlign: "right" }}>Size</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="file-cell">
                      <FileIcon type={f.type} />
                      <div>
                        <button
                          type="button"
                          className="file-name file-name-link"
                          onClick={() => void openDocument(f.id, f.name)}
                          title={`Open "${f.name}" in a new tab`}
                        >
                          {f.name}
                        </button>
                        <div className="file-sub">embedded · {f.chunks} chunks</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {f.tags.length === 0 ? (
                      <span style={{ color: "var(--muted-2)", fontSize: 12 }}>—</span>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {f.tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className="tag-chip"
                            onClick={() => toggleFilter(t)}
                            style={{ cursor: "pointer" }}
                            title={`Filter by "${t}"`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11.5,
                        color: "var(--muted)",
                      }}
                    >
                      {f.uploaded}
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      color: "var(--ink-2)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmtBytes(f.size)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
