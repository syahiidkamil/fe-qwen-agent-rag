import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useUsersStore } from "@/stores/useUsersStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ManagedUser } from "@/services/UserService";

interface EditEmailDialogProps {
  user: ManagedUser;
  onClose: () => void;
}

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type EditEmailValues = z.infer<typeof schema>;

export function EditEmailDialog({ user, onClose }: EditEmailDialogProps) {
  const updateEmail = useUsersStore((s) => s.updateEmail);
  const myId = useAuthStore((s) => s.userId);
  const refreshAuth = useAuthStore((s) => s.refresh);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    // isDirty is false until the field differs from the current email, so the
    // Save button stays disabled for a no-op edit.
    formState: { errors, isDirty },
  } = useForm<EditEmailValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: user.email },
  });

  // Esc closes the dialog (mirrors AddUserDialog's form phase).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const onSubmit = async (data: EditEmailValues) => {
    // Belt-and-suspenders: the disabled Save button already blocks this.
    if (data.email === user.email) {
      onClose();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateEmail(user.id, data.email);
      // Editing your own email: refresh the session so the header (and any
      // other session-derived UI) shows the new address without a re-login.
      if (user.id === myId) {
        await refreshAuth().catch(() => {
          /* best-effort — the row already shows the new email */
        });
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_EXISTS") {
        setSubmitError("A user with that email already exists.");
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Could not update email");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <h2 className="modal-title">Edit email</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-body">
          <label className="field">
            <div className="field-label">
              <span>Work email</span>
            </div>
            <input
              className="input"
              type="email"
              autoComplete="off"
              placeholder="name@airanext.id"
              autoFocus
              {...register("email")}
            />
            {errors.email && (
              <div className="field-error">{errors.email.message}</div>
            )}
          </label>

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
              type="submit"
              className="btn btn-teal btn-sm"
              disabled={submitting || !isDirty}
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
