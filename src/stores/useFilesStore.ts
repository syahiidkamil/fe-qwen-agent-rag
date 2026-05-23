import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { KbFile } from "@/types/file";
import { SEED_FILES } from "@/lib/mock-data";
import { inferFileType } from "@/lib/format";

interface FilesState {
  files: KbFile[];
  ingestImmediately: boolean;
  setIngestImmediately: (v: boolean) => void;
  addFiles: (rawFiles: File[]) => void;
  removeFile: (id: string) => void;
  startIngest: (id: string) => void;
  retryIngest: (id: string) => void;
  _tick: () => void;
}

let progressInterval: ReturnType<typeof setInterval> | null = null;

function chunksFor(size: number): number {
  return Math.max(8, Math.round(size / 6000) + Math.floor(Math.random() * 12));
}

export const useFilesStore = create<FilesState>()(
  persist(
    (set, get) => ({
      files: SEED_FILES,
      ingestImmediately: true,
      setIngestImmediately: (v) => set({ ingestImmediately: v }),

      addFiles: (rawFiles) => {
        const startAuto = get().ingestImmediately;
        const next: KbFile[] = rawFiles.map((rf, i) => ({
          id: `f${Date.now()}-${i}`,
          name: rf.name,
          size: rf.size,
          type: inferFileType(rf.name),
          status: startAuto ? "ingesting" : "uploaded",
          uploaded: "just now",
          chunks: 0,
          progress: startAuto ? 0 : 0,
        }));
        set({ files: [...next, ...get().files] });
        toast(`${rawFiles.length} file${rawFiles.length === 1 ? "" : "s"} added`);
        if (startAuto) ensureTicker();
      },

      removeFile: (id) =>
        set((s) => ({ files: s.files.filter((f) => f.id !== id) })),

      startIngest: (id) => {
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id ? { ...f, status: "ingesting", progress: 0 } : f,
          ),
        }));
        ensureTicker();
      },

      retryIngest: (id) => {
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id
              ? { ...f, status: "ingesting", progress: 0, error: undefined }
              : f,
          ),
        }));
        ensureTicker();
      },

      _tick: () => {
        const files = get().files;
        let stillIngesting = false;
        const nextFiles = files.map((f) => {
          if (f.status !== "ingesting") return f;
          const step = 3 + Math.floor(Math.random() * 6);
          const progress = Math.min(100, f.progress + step);
          if (progress >= 100) {
            const chunks = chunksFor(f.size);
            queueMicrotask(() =>
              toast(`${f.name} · ingested ${chunks} chunks`),
            );
            return { ...f, status: "ingested" as const, progress: 100, chunks };
          }
          stillIngesting = true;
          return { ...f, progress };
        });
        set({ files: nextFiles });
        if (!stillIngesting && progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      },
    }),
    {
      name: "airanext.files.v2",
      version: 1,
      // do not persist the interval
      partialize: (s) => ({
        files: s.files,
        ingestImmediately: s.ingestImmediately,
      }),
      onRehydrateStorage: () => (state) => {
        // restart the ticker if any file was mid-ingest at reload
        if (state?.files.some((f) => f.status === "ingesting")) {
          ensureTicker();
        }
      },
    },
  ),
);

function ensureTicker() {
  if (progressInterval) return;
  progressInterval = setInterval(() => {
    useFilesStore.getState()._tick();
  }, 450);
}
