import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useUsersStore } from "@/stores/useUsersStore";
import type { ManagedUser } from "@/services/UserService";

interface DeleteUserDialogProps {
  user: ManagedUser;
  onClose: () => void;
}

export function DeleteUserDialog({ user, onClose }: DeleteUserDialogProps) {
  const remove = useUsersStore((s) => s.remove);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Esc closes the dialog (mirrors the other admin dialogs).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const onConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await remove(user.id);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.code === "SUPER_ADMIN_DELETE_FORBIDDEN") {
        setSubmitError("Super admin accounts cannot be deleted.");
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Could not delete user");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <h2 className="modal-title">Delete user</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="modal-body">
          <div className="post-create-banner" style={{ color: "var(--red)" }}>
            <AlertTriangle size={16} strokeWidth={1.8} />
            <span>
              This permanently deletes <strong>{user.email}</strong> and cannot
              be undone. The user loses access immediately.
            </span>
          </div>

          {submitError && (
            <div className="field-error" style={{ marginTop: 4 }}>
              {submitError}
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
              type="button"
              className="btn btn-danger btn-sm"
              onClick={onConfirm}
              disabled={submitting}
            >
              {submitting ? "Deleting…" : "Delete user"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
