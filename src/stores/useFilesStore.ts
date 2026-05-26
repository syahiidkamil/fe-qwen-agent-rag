import { create } from "zustand";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { DocumentService } from "@/services/DocumentService";
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

let pollTimer: ReturnType<typeof setInterval> | null = null;

function setFiles(set: (s: Partial<FilesState>) => void, files: KbFile[]) {
  set({ files });
  ensurePolling(files);
}

function ensurePolling(files: KbFile[]) {
  const stillBusy = files.some((f) => f.status === "uploaded" || f.status === "ingesting");
  if (stillBusy && !pollTimer) {
    pollTimer = setInterval(async () => {
      try {
        const fresh = await DocumentService.list();
        useFilesStore.setState({ files: fresh });
        const busy = fresh.some((f) => f.status === "uploaded" || f.status === "ingesting");
        if (!busy && pollTimer) {
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

export const useFilesStore = create<FilesState>((set, get) => ({
  files: [],
  loading: false,
  ingestImmediately: true,

  setIngestImmediately: (v) => set({ ingestImmediately: v }),

  async refresh() {
    set({ loading: true });
    try {
      const files = await DocumentService.list();
      setFiles(set, files);
    } catch (err) {
      toast.error(`Failed to load documents: ${describeError(err)}`);
    } finally {
      set({ loading: false });
    }
  },

  async addFiles(rawFiles) {
    for (const rf of rawFiles) {
      try {
        const created = await DocumentService.upload(rf);
        set((s) => ({ files: [created, ...s.files] }));
      } catch (err) {
        toast.error(`Upload failed for ${rf.name}: ${describeError(err)}`);
      }
    }
    toast(`${rawFiles.length} file${rawFiles.length === 1 ? "" : "s"} uploaded`);
    ensurePolling(get().files);
  },

  async removeFile(id) {
    try {
      await DocumentService.remove(id);
      set((s) => ({ files: s.files.filter((f) => f.id !== id) }));
    } catch (err) {
      toast.error(`Delete failed: ${describeError(err)}`);
    }
  },

  async startIngest(id) {
    try {
      const updated = await DocumentService.reingest(id);
      set((s) => ({ files: s.files.map((f) => (f.id === id ? updated : f)) }));
      ensurePolling(get().files);
    } catch (err) {
      toast.error(`Re-ingest failed: ${describeError(err)}`);
    }
  },

  async retryIngest(id) {
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
