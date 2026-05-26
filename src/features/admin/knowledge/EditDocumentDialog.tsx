import { useEffect, useMemo, useRef, useState } from "react";
import { Tag, X } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useFilesStore } from "@/stores/useFilesStore";
import type { KbFile } from "@/types/file";

interface EditDocumentDialogProps {
  file: KbFile;
  onClose: () => void;
}

const MAX_TAGS = 16;
const MAX_TAG_LEN = 32;

/**
 * Edit dialog for a knowledge-base document. Both filename and tags are
 * editable; submit sends a partial PATCH only for the fields that changed.
 * Backend validation errors (INVALID_FILENAME, INVALID_TAGS, EMPTY_PATCH)
 * surface inline.
 */
export function EditDocumentDialog({ file, onClose }: EditDocumentDialogProps) {
  const update = useFilesStore((s) => s.update);

  const [filename, setFilename] = useState(file.name);
  const [tags, setTags] = useState<string[]>([...file.tags]);
  const [tagDraft, setTagDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filenameRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const el = filenameRef.current;
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

  const filenameChanged = filename.trim() !== file.name;
  const tagsChanged = useMemo(() => {
    if (tags.length !== file.tags.length) return true;
    for (let i = 0; i < tags.length; i++) if (tags[i] !== file.tags[i]) return true;
    return false;
  }, [tags, file.tags]);
  const hasChanges = filenameChanged || tagsChanged;

  const addTagFromDraft = () => {
    const cleaned = tagDraft.trim().toLowerCase();
    if (!cleaned) {
      setTagDraft("");
      return;
    }
    if (cleaned.length > MAX_TAG_LEN) {
      setError(`Each tag must be ${MAX_TAG_LEN} characters or fewer.`);
      return;
    }
    if (/[\\/\\\\\x00]/.test(cleaned)) {
      setError("Tags cannot contain path separators or null bytes.");
      return;
    }
    if (tags.includes(cleaned)) {
      // Silently dedupe; still clear the input.
      setTagDraft("");
      return;
    }
    if (tags.length >= MAX_TAGS) {
      setError(`At most ${MAX_TAGS} tags per document.`);
      return;
    }
    setTags([...tags, cleaned]);
    setTagDraft("");
    setError(null);
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagFromDraft();
    } else if (e.key === "Backspace" && tagDraft === "" && tags.length > 0) {
      // Pop the last chip when backspacing on empty input.
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) {
      onClose();
      return;
    }
    const patch: { filename?: string; tags?: string[] } = {};
    if (filenameChanged) {
      const trimmed = filename.trim();
      if (!trimmed) {
        setError("Filename cannot be empty");
        return;
      }
      patch.filename = trimmed;
    }
    if (tagsChanged) {
      patch.tags = tags;
    }
    setSubmitting(true);
    setError(null);
    try {
      await update(file.id, patch);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError("Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <h2 className="modal-title">Edit document</h2>
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
              ref={filenameRef}
              className="input"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              maxLength={255}
              autoComplete="off"
            />
            <div className="field-sub">
              Storage object is untouched — chunks and source chips keep
              working.
            </div>
          </label>

          <div className="field">
            <div className="field-label">
              <span>Tags</span>
            </div>
            <div className="tag-input">
              {tags.map((t) => (
                <span key={t} className="tag-chip" data-removable>
                  <Tag size={10} strokeWidth={2} />
                  {t}
                  <button
                    type="button"
                    className="tag-chip-x"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove tag ${t}`}
                  >
                    <X size={10} strokeWidth={2.4} />
                  </button>
                </span>
              ))}
              <input
                className="tag-input-field"
                type="text"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={onTagKeyDown}
                onBlur={addTagFromDraft}
                placeholder={tags.length === 0 ? "Add a tag — press Enter" : ""}
                maxLength={MAX_TAG_LEN + 4}
                autoComplete="off"
              />
            </div>
            <div className="field-sub">
              max {MAX_TAGS} tags · {MAX_TAG_LEN} chars each · case-folded ·
              press Enter or comma to add
            </div>
          </div>

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
              disabled={submitting || !hasChanges}
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
