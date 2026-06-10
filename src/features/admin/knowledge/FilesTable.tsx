import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Check, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { KbFile } from "@/types/file";
import { useFilesStore } from "@/stores/useFilesStore";
import { FileIcon } from "@/components/shared/FileIcon";
import { fmtBytes } from "@/lib/format";
import { DocumentService } from "@/services/DocumentService";
import { EditDocumentDialog } from "@/features/admin/knowledge/EditDocumentDialog";

async function openDocument(file: KbFile) {
  try {
    const url = await DocumentService.getViewUrl(file.id);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not open document";
    toast.error(msg);
  }
}

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
            <th style={{ width: "32%" }}>File</th>
            <th>Status</th>
            <th style={{ width: "120px" }}>Tags</th>
            <th>Uploaded</th>
            <th style={{ textAlign: "right", minWidth: "84px" }}>Size</th>
            <th>Actions</th>
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
      <td className="cell-main">
        {f.status === "ingested" || f.status === "uploaded" ? (
          <button
            type="button"
            className="file-cell file-cell-link"
            onClick={() => void openDocument(f)}
            title={`Open "${f.name}" in a new tab`}
          >
            <FileIcon type={f.type} />
            <div>
              <div className="file-name">{f.name}</div>
              {f.status === "ingested" && (
                <div className="file-sub">{f.chunks} chunks indexed</div>
              )}
              {f.status === "uploaded" && (
                <div className="file-sub">awaiting ingest</div>
              )}
            </div>
          </button>
        ) : (
          <div className="file-cell">
            <FileIcon type={f.type} />
            <div>
              <div className="file-name">{f.name}</div>
              {f.status === "failed" && (
                <div className="file-sub" style={{ color: "var(--red)" }}>
                  ingestion failed
                </div>
              )}
              {f.status === "ingesting" && (
                <div className="file-sub">embedding · vectorizing · indexing</div>
              )}
            </div>
          </div>
        )}
      </td>
      <td className="cell-status">
        <span className={`pill ${f.status}`}>
          <span className="pill-dot" />
          {f.status}
        </span>
      </td>
      <td className="cell-tags">
        {f.tags.length === 0 ? (
          <span className="tag-empty" style={{ color: "var(--muted-2)", fontSize: 12 }}>—</span>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {f.tags.map((t) => (
              <span key={t} className="tag-chip">{t}</span>
            ))}
          </div>
        )}
      </td>
      <td className="cell-date" style={{ whiteSpace: "nowrap" }}>
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
        className="cell-size"
        style={{
          textAlign: "right",
          fontFamily: "var(--mono)",
          fontSize: 12,
          color: "var(--ink-2)",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {fmtBytes(f.size)}
      </td>
      <td className="cell-actions">
        <div className="row-actions">
          {f.status === "uploaded" && (
            <button type="button" className="row-act row-act-primary" onClick={onIngest}>
              <Check size={11} strokeWidth={1.8} />
              Ingest
            </button>
          )}
          {f.status === "failed" && (
            <>
              <button type="button" className="row-act" onClick={onRetry}>
                <RotateCcw size={11} strokeWidth={1.5} />
                Retry
              </button>
              {f.error && (
                <button
                  type="button"
                  className="row-error-hint"
                  data-tip={f.error}
                  aria-label={`Error details: ${f.error}`}
                  onClick={() => toast.error(f.error ?? "Unknown error")}
                >
                  <AlertCircle size={14} strokeWidth={1.8} />
                </button>
              )}
            </>
          )}
          {f.status === "ingested" && (
            <button
              type="button"
              className="row-act"
              onClick={onIngest}
              title="Re-embed this file"
            >
              <RotateCcw size={11} strokeWidth={1.5} />
              Reingest
            </button>
          )}
          <button
            type="button"
            className="row-act row-act-icon"
            onClick={onRename}
            title="Edit document"
            aria-label="Edit document"
          >
            <Pencil size={12} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            className="row-act row-act-icon row-act-danger"
            onClick={onRemove}
            title="Remove"
            aria-label="Remove"
          >
            <Trash2 size={12} strokeWidth={1.6} />
          </button>
        </div>
      </td>
    </tr>
  );
}
