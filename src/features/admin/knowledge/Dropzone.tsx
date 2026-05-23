import { useRef, useState } from "react";
import { Upload, ArrowDown } from "lucide-react";
import { useFilesStore } from "@/stores/useFilesStore";
import { Checkbox } from "@/components/shared/Checkbox";

export function Dropzone() {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addFiles = useFilesStore((s) => s.addFiles);
  const ingestImmediately = useFilesStore((s) => s.ingestImmediately);
  const setIngestImmediately = useFilesStore((s) => s.setIngestImmediately);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      className="dropzone"
      data-drag={drag}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
    >
      <div className="dropzone-text">
        <div className="dropzone-icon">
          <Upload size={26} strokeWidth={1.6} />
        </div>
        <div className="dropzone-title">Drop documents here</div>
        <div className="dropzone-sub">
          PDF · DOCX · MD · TXT · CSV · HTML · max 50 MB per file
        </div>
      </div>
      <div className="dropzone-controls">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => inputRef.current?.click()}
        >
          Browse files
          <ArrowDown size={12} strokeWidth={1.6} />
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) {
              addFiles(Array.from(e.target.files));
              e.target.value = "";
            }
          }}
        />
        <Checkbox
          checked={ingestImmediately}
          onChange={setIngestImmediately}
          label="Ingest immediately on upload"
        />
      </div>
    </div>
  );
}
