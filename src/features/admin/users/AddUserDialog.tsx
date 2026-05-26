import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, Eye, EyeOff, ShieldCheck, X } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useUsersStore } from "@/stores/useUsersStore";
import type { UserRole } from "@/services/UserService";

interface AddUserDialogProps {
  onClose: () => void;
}

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Min 8 characters"),
  role: z.enum(["user", "admin", "super_admin"]),
});

type AddUserValues = z.infer<typeof schema>;

type Phase = "form" | "created";

interface CreatedSnapshot {
  email: string;
  password: string;
  role: UserRole;
}

export function AddUserDialog({ onClose }: AddUserDialogProps) {
  const create = useUsersStore((s) => s.create);
  const [phase, setPhase] = useState<Phase>("form");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Held only in state during the "created" phase so we can wipe it on Done.
  const [snapshot, setSnapshot] = useState<CreatedSnapshot | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddUserValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", role: "user" },
  });

  // Esc closes when in the form phase. In the "created" phase the only
  // way out is the explicit Done button (forces acknowledgement).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "form") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase]);

  const onSubmit = async (data: AddUserValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await create(data);
      setSnapshot({ email: data.email, password: data.password, role: data.role });
      setPhase("created");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "EMAIL_EXISTS") {
          setSubmitError("A user with that email already exists.");
        } else {
          setSubmitError(err.message);
        }
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Could not create user");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard blocked — user can still select manually */
    }
  };

  const handleDone = () => {
    // Wipe the password from memory before closing.
    setSnapshot(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <h2 className="modal-title">
            {phase === "form" ? "Add user" : "User created"}
          </h2>
          {phase === "form" && (
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>

        {phase === "form" && (
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
                {...register("email")}
              />
              {errors.email && (
                <div className="field-error">{errors.email.message}</div>
              )}
            </label>

            <label className="field">
              <div className="field-label">
                <span>Password</span>
              </div>
              <div className="input-with-action">
                <input
                  className="input"
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? (
                    <EyeOff size={14} strokeWidth={1.8} />
                  ) : (
                    <Eye size={14} strokeWidth={1.8} />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="field-error">{errors.password.message}</div>
              )}
            </label>

            <fieldset className="field">
              <div className="field-label">
                <span>Role</span>
              </div>
              <div className="role-radios">
                <label className="role-radio">
                  <input type="radio" value="user" {...register("role")} />
                  <span>User</span>
                  <em>chat-only access</em>
                </label>
                <label className="role-radio">
                  <input type="radio" value="admin" {...register("role")} />
                  <span>Admin</span>
                  <em>knowledge base + users</em>
                </label>
                <label className="role-radio">
                  <input type="radio" value="super_admin" {...register("role")} />
                  <span>Super admin</span>
                  <em>+ landing CMS</em>
                </label>
              </div>
            </fieldset>

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
                disabled={submitting}
              >
                {submitting ? "Creating…" : "Create user"}
              </button>
            </div>
          </form>
        )}

        {phase === "created" && snapshot && (
          <div className="modal-body">
            <div className="post-create-banner">
              <ShieldCheck size={16} strokeWidth={1.8} />
              <span>
                Share these credentials now — this is your only chance to copy
                the password.
              </span>
            </div>

            <div className="post-create-row">
              <div className="post-create-label">Email</div>
              <div className="post-create-value-wrap">
                <code className="post-create-value">{snapshot.email}</code>
                <button
                  type="button"
                  className="input-action"
                  onClick={() => copy(snapshot.email)}
                  aria-label="Copy email"
                  title="Copy email"
                >
                  <Copy size={13} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div className="post-create-row">
              <div className="post-create-label">Password</div>
              <div className="post-create-value-wrap">
                <code className="post-create-value">{snapshot.password}</code>
                <button
                  type="button"
                  className="input-action"
                  onClick={() => copy(snapshot.password)}
                  aria-label="Copy password"
                  title="Copy password"
                >
                  <Copy size={13} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div className="post-create-row">
              <div className="post-create-label">Role</div>
              <code className="post-create-value">{snapshot.role}</code>
            </div>

            <div className="modal-foot">
              <button
                type="button"
                className="btn btn-teal btn-sm"
                onClick={handleDone}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
