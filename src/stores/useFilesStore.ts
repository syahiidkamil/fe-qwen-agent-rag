import { create } from "zustand";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { DocumentService, inferType } from "@/services/DocumentService";
import type { KbFile } from "@/types/file";

interface FilesState {
  files: KbFile[];
  loading: boolean;
  ingestImmediately: boolean;
  setIngestImmediately: (v: boolean) => void;
  refresh: () => Promise<void>;
  addFiles: (rawFiles: File[]) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  startIngest: (id: string) => Promise<void>;
  retryIngest: (id: string) => Promise<void>;
  update: (id: string, patch: { filename?: string; tags?: string[] }) => Promise<void>;
}

/** Newly dropped files get a client-side id under this prefix until the
 *  upload POST returns a real one. It's how we tell an optimistic row apart
 *  from a server-backed one during polling and delete. */
const TEMP_PREFIX = "temp-";

/** How many files upload at once. A small pool keeps the UI responsive and
 *  staggers the server-side ingestion kick-offs (each ingest hits a
 *  rate-limited embedder) without serializing the whole batch. */
const UPLOAD_CONCURRENCY = 4;

let pollTimer: ReturnType<typeof setInterval> | null = null;
let tempSeq = 0;

/** Original File objects for optimistic rows, kept so a failed upload can be
 *  retried without asking the user to pick the file again. Cleared on success
 *  or when the row is dismissed. */
const pendingUploads = new Map<string, File>();

function isTempId(id: string): boolean {
  return id.startsWith(TEMP_PREFIX);
}

/** True while a file's bytes still need to reach the server — i.e. it's
 *  queued, uploading, or its upload failed and can be retried. Lets the table
 *  tell an upload failure apart from an ingestion failure. */
export function isPendingUpload(id: string): boolean {
  return pendingUploads.has(id);
}

function isClientOnly(f: KbFile): boolean {
  return isTempId(f.id);
}

/** Server rows are authoritative, but a row we just advanced to "ingesting"
 *  optimistically must not be dragged back to "uploaded" by a poll that fired
 *  before the background task flipped it — that would flash a spurious Ingest
 *  button mid-batch. Client-only rows (still uploading/queued/failed-upload)
 *  have no server presence yet, so they're carried over untouched. */
function mergeServer(current: KbFile[], server: KbFile[]): KbFile[] {
  const currentById = new Map(current.map((f) => [f.id, f]));
  const merged = server.map((sf) => {
    const cf = currentById.get(sf.id);
    if (cf && cf.status === "ingesting" && sf.status === "uploaded") return cf;
    return sf;
  });
  const clientOnly = current.filter(isClientOnly);
  return [...clientOnly, ...merged];
}

/** Self-sustaining poll while any row is mid-ingest. "uploaded" is a stable
 *  state (waiting for a manual Ingest), so it no longer keeps the timer alive. */
function ensurePolling(files: KbFile[]) {
  const stillBusy = files.some((f) => f.status === "ingesting");
  if (stillBusy && !pollTimer) {
    pollTimer = setInterval(async () => {
      try {
        const fresh = await DocumentService.list();
        const merged = mergeServer(useFilesStore.getState().files, fresh);
        useFilesStore.setState({ files: merged });
        if (!merged.some((f) => f.status === "ingesting") && pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
      } catch {
        // swallow — next tick will retry
      }
    }, 2000);
  } else if (!stillBusy && pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) return `${err.code}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

function optimisticRow(id: string, file: File): KbFile {
  return {
    id,
    name: file.name,
    size: file.size,
    type: inferType(file.name, file.type || null),
    status: "queued",
    uploaded: "—",
    chunks: 0,
    progress: 0,
    tags: [],
  };
}

/** Run `worker` over `items` with at most `limit` in flight at once. */
async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const lane = async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, lane),
  );
}

export const useFilesStore = create<FilesState>((set, get) => ({
  files: [],
  loading: false,
  ingestImmediately: true,

  setIngestImmediately: (v) => set({ ingestImmediately: v }),

  async refresh() {
    set({ loading: true });
    try {
      const fresh = await DocumentService.list();
      const merged = mergeServer(get().files, fresh);
      set({ files: merged });
      ensurePolling(merged);
    } catch (err) {
      toast.error(`Failed to load documents: ${describeError(err)}`);
    } finally {
      set({ loading: false });
    }
  },

  async addFiles(rawFiles) {
    if (!rawFiles.length) return;
    const ingest = get().ingestImmediately;

    // 1. Show every file instantly as "queued" — newest on top. No await yet,
    //    so the table fills the moment the picker closes.
    const jobs = rawFiles.map((file) => {
      const id = `${TEMP_PREFIX}${tempSeq++}`;
      pendingUploads.set(id, file);
      return { id, file };
    });
    set((s) => ({ files: [...jobs.map((j) => optimisticRow(j.id, j.file)), ...s.files] }));

    // 2. Upload in parallel (bounded). Each row flips queued → uploading →
    //    (server row), or → failed with a retry affordance.
    let failed = 0;
    await runPool(jobs, UPLOAD_CONCURRENCY, async ({ id, file }) => {
      patchRow(id, { status: "uploading" });
      try {
        const created = await DocumentService.upload(file, ingest);
        pendingUploads.delete(id);
        // ingest=true means the server already queued ingestion, so reflect
        // "ingesting" rather than the transient "uploaded" it echoes back.
        const row: KbFile = ingest
          ? { ...created, status: "ingesting", progress: 50 }
          : created;
        replaceRow(id, row);
      } catch (err) {
        failed += 1;
        patchRow(id, { status: "failed", error: describeError(err) });
      }
    });

    // 3. One summary toast instead of per-file noise.
    const ok = jobs.length - failed;
    if (failed === 0) {
      toast(`${ok} file${ok === 1 ? "" : "s"} uploaded`);
    } else if (ok === 0) {
      toast.error(`Upload failed for all ${failed} file${failed === 1 ? "" : "s"}`);
    } else {
      toast.warning(`${ok} uploaded, ${failed} failed`);
    }
    ensurePolling(get().files);
  },

  async removeFile(id) {
    // A failed/queued optimistic row has no server presence — just drop it.
    if (isTempId(id)) {
      pendingUploads.delete(id);
      set((s) => ({ files: s.files.filter((f) => f.id !== id) }));
      return;
    }
    try {
      await DocumentService.remove(id);
      set((s) => ({ files: s.files.filter((f) => f.id !== id) }));
    } catch (err) {
      toast.error(`Delete failed: ${describeError(err)}`);
    }
  },

  async startIngest(id) {
    // Optimistically flip to "ingesting" for instant feedback — reingest
    // always queues the task, so the echoed "uploaded" would only flicker.
    const previous = get().files;
    patchRow(id, { status: "ingesting", progress: 50, error: undefined });
    try {
      await DocumentService.reingest(id);
      ensurePolling(get().files);
    } catch (err) {
      set({ files: previous });
      toast.error(`Re-ingest failed: ${describeError(err)}`);
    }
  },

  async retryIngest(id) {
    // A failed *upload* never reached the server (no row to reingest); a
    // failed *ingest* has a real row. Dispatch on which one this is.
    const file = pendingUploads.get(id);
    if (file) {
      const ingest = get().ingestImmediately;
      patchRow(id, { status: "uploading", error: undefined });
      try {
        const created = await DocumentService.upload(file, ingest);
        pendingUploads.delete(id);
        const row: KbFile = ingest
          ? { ...created, status: "ingesting", progress: 50 }
          : created;
        replaceRow(id, row);
        ensurePolling(get().files);
      } catch (err) {
        patchRow(id, { status: "failed", error: describeError(err) });
      }
      return;
    }
    return get().startIngest(id);
  },

  async update(id, patch) {
    // Apply both fields optimistically — flip the row immediately, revert on error.
    const previous = get().files;
    const optimistic = previous.map((f) =>
      f.id === id
        ? {
            ...f,
            ...(patch.filename !== undefined ? { name: patch.filename.trim() } : {}),
            ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
          }
        : f,
    );
    set({ files: optimistic });
    try {
      const updated = await DocumentService.update(id, patch);
      set((s) => ({
        files: s.files.map((f) => (f.id === id ? updated : f)),
      }));
      toast(`Saved ${updated.name}`);
    } catch (err) {
      set({ files: previous });
      toast.error(`Save failed: ${describeError(err)}`);
      throw err;
    }
  },
}));

function patchRow(id: string, patch: Partial<KbFile>) {
  useFilesStore.setState((s) => ({
    files: s.files.map((f) => (f.id === id ? { ...f, ...patch } : f)),
  }));
}

function replaceRow(id: string, row: KbFile) {
  useFilesStore.setState((s) => ({
    files: s.files.map((f) => (f.id === id ? row : f)),
  }));
}
