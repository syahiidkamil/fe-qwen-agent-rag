import { Search } from "lucide-react";
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
  search: string;
  setSearch: (v: string) => void;
  filter: "all" | KbFileStatus;
  setFilter: (v: "all" | KbFileStatus) => void;
}

export function FilesToolbar({
  files,
  search,
  setSearch,
  filter,
  setFilter,
}: FilesToolbarProps) {
  const counts: Record<string, number> = { all: files.length };
  for (const f of files) {
    counts[f.status] = (counts[f.status] ?? 0) + 1;
  }

  return (
    <div className="kb-toolbar">
      <div className="search">
        <Search size={14} strokeWidth={1.6} style={{ color: "var(--muted)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filename…"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            style={{
              background: "transparent",
              border: 0,
              color: "var(--muted)",
              fontSize: 16,
              padding: 0,
              lineHeight: 1,
              cursor: "pointer",
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
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
