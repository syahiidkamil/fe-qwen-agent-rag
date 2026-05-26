import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useFilesStore } from "@/stores/useFilesStore";
import type { KbFileStatus } from "@/types/file";
import { Dropzone } from "@/features/admin/knowledge/Dropzone";
import { FilesToolbar } from "@/features/admin/knowledge/FilesToolbar";
import { FilesTable } from "@/features/admin/knowledge/FilesTable";

export function AdminKnowledgePage() {
  const files = useFilesStore((s) => s.files);
  const startIngest = useFilesStore((s) => s.startIngest);
  const refresh = useFilesStore((s) => s.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | KbFileStatus>("all");

  const filtered = useMemo(() => {
    return files.filter((f) => {
      if (filter !== "all" && f.status !== filter) return false;
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [files, filter, search]);

  const pendingCount = files.filter((f) => f.status === "uploaded").length;

  const ingestAllPending = () => {
    const pending = files.filter((f) => f.status === "uploaded");
    if (!pending.length) {
      toast("Nothing to ingest");
      return;
    }
    for (const p of pending) void startIngest(p.id);
    toast(
      `Ingesting ${pending.length} pending file${pending.length === 1 ? "" : "s"}`,
    );
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Knowledge base</span>
          <h1 className="page-title">Ingest the corpus that powers Aira</h1>
        </div>
        <div className="page-actions">
          {pendingCount > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={ingestAllPending}
            >
              Ingest all pending ({pendingCount})
            </button>
          )}
        </div>
      </div>

      <Dropzone />

      <FilesToolbar
        files={files}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
      />

      <FilesTable
        files={filtered}
        filterActive={search !== "" || filter !== "all"}
      />
    </>
  );
}
