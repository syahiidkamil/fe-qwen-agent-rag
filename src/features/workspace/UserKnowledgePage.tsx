import { useEffect, useMemo, useState } from "react";

import { useFilesStore } from "@/stores/useFilesStore";
import { FileIcon } from "@/components/shared/FileIcon";
import { fmtBytes } from "@/lib/format";

/**
 * Read-only knowledge-base browser for the user role.
 *
 * Shows ingested documents only (uploaded / ingesting / failed are hidden —
 * users don't need to know about admin-side ingestion plumbing). The tag
 * filter bar lists every distinct tag in the visible corpus; selecting one
 * or more tags filters via OR — a document is shown if any of its tags
 * match any of the selected filter chips. The filter is lexical: exact tag
 * match, case-folded — no fuzzy / substring search this phase.
 */
export function UserKnowledgePage() {
  const files = useFilesStore((s) => s.files);
  const loading = useFilesStore((s) => s.loading);
  const refresh = useFilesStore((s) => s.refresh);

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Only ingested docs are useful to the end user.
  const visibleCorpus = useMemo(
    () => files.filter((f) => f.status === "ingested"),
    [files],
  );

  // Tags currently present in the visible corpus (deduped, sorted).
  const corpusTags = useMemo(() => {
    const set = new Set<string>();
    for (const f of visibleCorpus) for (const t of f.tags) set.add(t);
    return [...set].sort();
  }, [visibleCorpus]);

  // OR filter: file shown if it has at least one selected tag.
  // With zero chips selected, show all visible files.
  const filteredFiles = useMemo(() => {
    if (selectedTags.size === 0) return visibleCorpus;
    return visibleCorpus.filter((f) =>
      f.tags.some((t) => selectedTags.has(t)),
    );
  }, [visibleCorpus, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Knowledge base</span>
          <h1 className="page-title">What Aira can read for you</h1>
        </div>
      </div>

      {corpusTags.length > 0 && (
        <div className="tag-filter-bar">
          <span className="tag-filter-label">Filter by tag</span>
          {corpusTags.map((t) => {
            const active = selectedTags.has(t);
            return (
              <button
                key={t}
                type="button"
                className="tag-filter-chip"
                data-active={active ? "true" : undefined}
                onClick={() => toggleTag(t)}
              >
                {t}
              </button>
            );
          })}
          {selectedTags.size > 0 && (
            <button
              type="button"
              className="tag-filter-clear"
              onClick={() => setSelectedTags(new Set())}
            >
              clear ({selectedTags.size})
            </button>
          )}
        </div>
      )}

      <div className="table-wrap">
        {loading && visibleCorpus.length === 0 ? (
          <div className="kb-empty">Loading documents…</div>
        ) : filteredFiles.length === 0 ? (
          <div className="kb-empty">
            {selectedTags.size === 0
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
                            onClick={() => toggleTag(t)}
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
