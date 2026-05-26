import { useState } from "react";
import { toast } from "sonner";
import { Check, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { KbFile } from "@/types/file";
import { useFilesStore } from "@/stores/useFilesStore";
import { FileIcon } from "@/components/shared/FileIcon";
import { fmtBytes } from "@/lib/format";
import { DocumentService } from "@/services/DocumentService";
import { EditDocumentDialog } from "@/features/admin/knowledge/EditDocumentDialog";

async function openDocument(file: KbFile) {
  // Open the tab synchronously so the browser counts it as user-initiated;
  // navigate it to the signed URL once the API call returns. If we awaited
  // first, Safari/Firefox would block the window.open() as a popup.
  const tab = window.open("about:blank", "_blank", "noopener");
  try {
    const url = await DocumentService.getViewUrl(file.id);
    if (tab) tab.location.href = url;
    else window.open(url, "_blank", "noopener");
  } catch (err) {
    if (tab) tab.close();
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
      <td>
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
              {f.error && (
                <div className="file-sub" style={{ color: "var(--red)" }}>
                  {f.error}
                </div>
              )}
              {!f.error && f.status === "ingested" && (
                <div className="file-sub">{f.chunks} chunks indexed</div>
              )}
              {!f.error && f.status === "uploaded" && (
                <div className="file-sub">awaiting ingest</div>
              )}
            </div>
          </button>
        ) : (
          <div className="file-cell">
            <FileIcon type={f.type} />
            <div>
              <div className="file-name">{f.name}</div>
              {f.error && (
                <div className="file-sub" style={{ color: "var(--red)" }}>
                  {f.error}
                </div>
              )}
              {!f.error && f.status === "ingesting" && (
                <div className="file-sub">embedding · vectorizing · indexing</div>
              )}
            </div>
          </div>
        )}
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
      <td style={{ whiteSpace: "nowrap" }}>
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
          whiteSpace: "nowrap",
        }}
      >
        {fmtBytes(f.size)}
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
