import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { X } from "lucide-react";

import { useFilesStore } from "@/stores/useFilesStore";
import { FileIcon } from "@/components/shared/FileIcon";
import { fmtBytes } from "@/lib/format";

/**
 * Read-only knowledge-base browser for the user role.
 *
 * Filter UX: active filters render as removable chips next to a free-form
 * input — typing then pressing space, comma, or Enter commits the token
 * as an active filter chip. Available corpus tags appear below as
 * clickable suggestions, capped at MAX_VISIBLE with a "+N more" toggle
 * so the bar never overwhelms the page when the corpus has many tags.
 * Filter is OR + case-folded across active chips.
 */
const MAX_VISIBLE_AVAILABLE = 12;

export function UserKnowledgePage() {
  const files = useFilesStore((s) => s.files);
  const loading = useFilesStore((s) => s.loading);
  const refresh = useFilesStore((s) => s.refresh);

  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(false);

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
    if (e.key === "Enter") {
      e.preventDefault();
      if (draft.trim()) addFilter(draft);
    } else if (e.key === "Backspace" && draft === "" && activeFilters.size > 0) {
      // Empty-field backspace removes the most recent chip.
      const last = [...activeFilters].pop();
      if (last) removeFilter(last);
    }
  };

  const availableTags = useMemo(
    () => corpusTags.filter((t) => !activeFilters.has(t.toLowerCase())),
    [corpusTags, activeFilters],
  );

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
        {availableTags.length > 0 && (
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
                        <div className="file-name">{f.name}</div>
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
