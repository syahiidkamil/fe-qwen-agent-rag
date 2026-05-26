import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useFilesStore } from "@/stores/useFilesStore";
import { Checkbox } from "@/components/shared/Checkbox";

/**
 * Single drop + click target for adding files to the knowledge base.
 * The whole card is the click affordance — there is no separate
 * "Browse files" button — and the same area accepts drag-and-drop.
 * The "Ingest immediately on upload" checkbox sits as a corner overlay
 * with stopPropagation so toggling it doesn't fire the picker.
 */
export function Dropzone() {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addFiles = useFilesStore((s) => s.addFiles);
  const ingestImmediately = useFilesStore((s) => s.ingestImmediately);
  const setIngestImmediately = useFilesStore((s) => s.setIngestImmediately);

  const openPicker = () => inputRef.current?.click();

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files.length) {
      void addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  return (
    <div
      className="dropzone"
      role="button"
      tabIndex={0}
      data-drag={drag}
      onClick={openPicker}
      onKeyDown={onKeyDown}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
    >
      <div
        className="dropzone-checkbox"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={ingestImmediately}
          onChange={setIngestImmediately}
          label="Ingest immediately on upload"
        />
      </div>

      <div className="dropzone-text">
        <div className="dropzone-icon">
          <Upload size={26} strokeWidth={1.6} />
        </div>
        <div className="dropzone-title">Drop documents here</div>
        <div className="dropzone-sub">
          or click anywhere in this area to browse · PDF · DOCX · MD · TXT · CSV ·
          HTML · max 50 MB per file
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) {
            void addFiles(Array.from(e.target.files));
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
