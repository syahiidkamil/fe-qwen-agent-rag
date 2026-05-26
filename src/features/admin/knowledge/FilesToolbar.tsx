import type { KbFile, KbFileStatus } from "@/types/file";

export const STATUS_FILTERS: ("all" | KbFileStatus)[] = [
  "all",
  "uploaded",
  "ingesting",
  "ingested",
  "failed",
];

interface FilesToolbarProps {
  files: KbFile[];
  filter: "all" | KbFileStatus;
  setFilter: (v: "all" | KbFileStatus) => void;
}

/**
 * Status-only filter strip for the admin KB table. Filename search has
 * moved to the shared <KbSearch> (hybrid vector + FTS over chunks)
 * which lives above the table; this component is now purely the
 * ingestion-status triage row.
 */
export function FilesToolbar({ files, filter, setFilter }: FilesToolbarProps) {
  const counts: Record<string, number> = { all: files.length };
  for (const f of files) {
    counts[f.status] = (counts[f.status] ?? 0) + 1;
  }

  return (
    <div className="kb-toolbar kb-toolbar-status-only">
      <div className="filters" role="tablist">
        {STATUS_FILTERS.map((s) => (
          <button
            type="button"
            key={s}
            className="filter-chip"
            data-on={filter === s}
            onClick={() => setFilter(s)}
            role="tab"
            aria-selected={filter === s}
          >
            {s} <span className="ct">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
