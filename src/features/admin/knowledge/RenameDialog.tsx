import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useFilesStore } from "@/stores/useFilesStore";
import type { KbFile } from "@/types/file";

interface RenameDialogProps {
  file: KbFile;
  onClose: () => void;
}

export function RenameDialog({ file, onClose }: RenameDialogProps) {
  const rename = useFilesStore((s) => s.rename);
  const [value, setValue] = useState(file.name);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    // Focus + select the basename portion for fast in-place edits.
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const dot = file.name.lastIndexOf(".");
    if (dot > 0) el.setSelectionRange(0, dot);
    else el.select();
  }, [file.name]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [submitting]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Filename cannot be empty");
      return;
    }
    if (trimmed === file.name) {
      onClose();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await rename(file.id, trimmed);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError("Rename failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <h2 className="modal-title">Rename document</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={submitting}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="modal-body">
          <label className="field">
            <div className="field-label">
              <span>Filename</span>
            </div>
            <input
              ref={inputRef}
              className="input"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={255}
              autoComplete="off"
            />
            <div
              className="field-sub"
              style={{
                fontSize: 11,
                color: "var(--muted)",
                fontFamily: "var(--mono)",
                marginTop: 6,
              }}
            >
              Storage object is untouched — chunks and source chips keep
              working.
            </div>
          </label>
          {error && (
            <div className="field-error" style={{ marginTop: 4 }}>
              {error}
            </div>
          )}
          <div className="modal-foot">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-teal btn-sm"
              disabled={submitting || !value.trim()}
            >
              {submitting ? "Saving…" : "Rename"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
