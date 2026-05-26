import { useState } from "react";
import { toast } from "sonner";
import { Check, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { KbFile } from "@/types/file";
import { useFilesStore } from "@/stores/useFilesStore";
import { FileIcon } from "@/components/shared/FileIcon";
import { fmtBytes } from "@/lib/format";
import { EditDocumentDialog } from "@/features/admin/knowledge/EditDocumentDialog";

interface FilesTableProps {
  files: KbFile[];
  filterActive: boolean;
}

export function FilesTable({ files, filterActive }: FilesTableProps) {
  const startIngest = useFilesStore((s) => s.startIngest);
  const retryIngest = useFilesStore((s) => s.retryIngest);
  const removeFile = useFilesStore((s) => s.removeFile);
  const [editTarget, setEditTarget] = useState<KbFile | null>(null);

  if (files.length === 0) {
    return (
      <div className="table-wrap">
        <div className="kb-empty">
          {filterActive
            ? "Nothing matches that filter."
            : "Drop a document above to begin."}
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="kb-table">
        <thead>
          <tr>
            <th style={{ width: "40%" }}>File</th>
            <th>Status</th>
            <th>Tags</th>
            <th>Uploaded</th>
            <th style={{ textAlign: "right" }}>Size</th>
            <th style={{ textAlign: "right" }}>Chunks</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <FileRow
              key={f.id}
              file={f}
              onIngest={() => {
                startIngest(f.id);
                toast(`Ingesting ${f.name}`);
              }}
              onRetry={() => retryIngest(f.id)}
              onRemove={() => {
                removeFile(f.id);
                toast(`Removed ${f.name}`);
              }}
              onRename={() => setEditTarget(f)}
            />
          ))}
        </tbody>
      </table>
      {editTarget && (
        <EditDocumentDialog
          file={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

interface FileRowProps {
  file: KbFile;
  onIngest: () => void;
  onRetry: () => void;
  onRemove: () => void;
  onRename: () => void;
}

function FileRow({ file: f, onIngest, onRetry, onRemove, onRename }: FileRowProps) {
  return (
    <tr>
      <td>
        <div className="file-cell">
          <FileIcon type={f.type} />
          <div>
            <div className="file-name">{f.name}</div>
            {f.error && (
              <div className="file-sub" style={{ color: "var(--red)" }}>
                {f.error}
              </div>
            )}
            {!f.error && f.status === "ingested" && (
              <div className="file-sub">
                embedded · {f.chunks} chunks indexed · text-embed-3
              </div>
            )}
            {!f.error && f.status === "uploaded" && (
              <div className="file-sub">awaiting ingest</div>
            )}
            {!f.error && f.status === "ingesting" && (
              <div className="file-sub">embedding · vectorizing · indexing</div>
            )}
          </div>
        </div>
      </td>
      <td>
        <span className={`pill ${f.status}`}>
          <span className="pill-dot" />
          {f.status}
          {f.status === "ingesting" && (
            <span className="progress-bar">
              <span className="progress-fill" style={{ width: `${f.progress}%` }} />
            </span>
          )}
        </span>
      </td>
      <td>
        {f.tags.length === 0 ? (
          <span style={{ color: "var(--muted-2)", fontSize: 12 }}>—</span>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {f.tags.map((t) => (
              <span key={t} className="tag-chip">{t}</span>
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
      <td
        style={{
          textAlign: "right",
          fontFamily: "var(--mono)",
          fontSize: 12,
          color: f.chunks ? "var(--ink-2)" : "var(--muted-2)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {f.chunks || "—"}
      </td>
      <td>
        <div className="row-actions">
          {f.status === "uploaded" && (
            <button type="button" className="row-act row-act-primary" onClick={onIngest}>
              <Check size={11} strokeWidth={1.8} />
              Ingest
            </button>
          )}
          {f.status === "failed" && (
            <button type="button" className="row-act" onClick={onRetry}>
              <RotateCcw size={11} strokeWidth={1.5} />
              Retry
            </button>
          )}
          {f.status === "ingested" && (
            <button
              type="button"
              className="row-act"
              onClick={onIngest}
              title="Re-embed this file"
            >
              <RotateCcw size={11} strokeWidth={1.5} />
              Re-ingest
            </button>
          )}
          <button
            type="button"
            className="row-act"
            onClick={onRename}
            title="Edit document"
            aria-label="Edit document"
          >
            <Pencil size={11} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="row-act row-act-danger"
            onClick={onRemove}
            title="Remove"
            aria-label="Remove"
          >
            <Trash2 size={11} strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}
