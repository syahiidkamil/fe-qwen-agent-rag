import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { useFilesStore } from "@/stores/useFilesStore";
import { FileIcon } from "@/components/shared/FileIcon";
import { KbSearch } from "@/components/shared/KbSearch";
import { fmtBytes } from "@/lib/format";
import { DocumentService } from "@/services/DocumentService";

/**
 * Read-only knowledge-base browser for the user role.
 *
 * Discovery is owned by <KbSearch /> at the top — hybrid vector + FTS
 * over chunk content. The table below is a flat list of ingested
 * documents, sized for "I want to see what's in here," not for query.
 * The old fuzzy tag-filter has been removed; the search now subsumes
 * it (a query for a tag name surfaces the chunks that mention it).
 */
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

export function UserKnowledgePage() {
  const files = useFilesStore((s) => s.files);
  const loading = useFilesStore((s) => s.loading);
  const refresh = useFilesStore((s) => s.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visibleCorpus = useMemo(
    () => files.filter((f) => f.status === "ingested"),
    [files],
  );

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Knowledge base</span>
          <h1 className="page-title">What Aira can read for you</h1>
        </div>
      </div>

      <KbSearch placement="user" />

      <div className="table-wrap">
        {loading && visibleCorpus.length === 0 ? (
          <div className="kb-empty">Loading documents…</div>
        ) : visibleCorpus.length === 0 ? (
          <div className="kb-empty">No documents indexed yet.</div>
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
              {visibleCorpus.map((f) => (
                <tr key={f.id}>
                  <td>
                    <button
                      type="button"
                      className="file-cell file-cell-link"
                      onClick={() => void openDocument(f.id, f.name)}
                      title={`Open "${f.name}" in a new tab`}
                    >
                      <FileIcon type={f.type} />
                      <div>
                        <div className="file-name">{f.name}</div>
                        <div className="file-sub">embedded · {f.chunks} chunks</div>
                      </div>
                    </button>
                  </td>
                  <td>
                    {f.tags.length === 0 ? (
                      <span style={{ color: "var(--muted-2)", fontSize: 12 }}>—</span>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {f.tags.map((t) => (
                          <span key={t} className="tag-chip">
                            {t}
                          </span>
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
