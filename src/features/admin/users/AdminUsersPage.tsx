import { useEffect, useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUsersStore } from "@/stores/useUsersStore";
import type { ManagedUser } from "@/services/UserService";
import { AddUserDialog } from "@/features/admin/users/AddUserDialog";
import { EditEmailDialog } from "@/features/admin/users/EditEmailDialog";
import { DeleteUserDialog } from "@/features/admin/users/DeleteUserDialog";

export function AdminUsersPage() {
  const users = useUsersStore((s) => s.users);
  const loading = useUsersStore((s) => s.loading);
  const refresh = useUsersStore((s) => s.refresh);
  const deactivate = useUsersStore((s) => s.deactivate);
  const reactivate = useUsersStore((s) => s.reactivate);
  // The signed-in user's id — used to hide deactivate on their own row.
  // Use the immutable Supabase user id rather than email (emails can change).
  const myId = useAuthStore((s) => s.userId);

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<ManagedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Users</span>
          <h1 className="page-title">Team members and access</h1>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-teal btn-sm"
            onClick={() => setShowAdd(true)}
          >
            <UserPlus size={12} strokeWidth={1.8} />
            Add user
          </button>
        </div>
      </div>

      <div className="table-wrap">
        {loading && users.length === 0 ? (
          <div className="kb-empty">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="kb-empty">No users yet.</div>
        ) : (
          <table className="kb-table">
            <thead>
              <tr>
                <th style={{ width: "45%" }}>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  isSelf={!!myId && u.id === myId}
                  onEdit={() => setEditTarget(u)}
                  onDelete={() => setDeleteTarget(u)}
                  onDeactivate={() => deactivate(u.id)}
                  onReactivate={() => reactivate(u.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <AddUserDialog
          onClose={() => {
            setShowAdd(false);
            void refresh();
          }}
        />
      )}

      {editTarget && (
        <EditEmailDialog
          user={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteUserDialog
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

interface UserRowProps {
  user: ManagedUser;
  isSelf: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}

function UserRow({ user, isSelf, onEdit, onDelete, onDeactivate, onReactivate }: UserRowProps) {
  // Super admins are protected from deletion (server enforces this too).
  const canDelete = !isSelf && user.role !== "super_admin";
  const roleLabel = user.role
    ? user.role.replace("_", " ")
    : "—";
  return (
    <tr>
      <td>
        <div className="file-cell">
          <div className="user-avatar">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="file-name">{user.email}</div>
            {isSelf && <div className="file-sub">that's you</div>}
          </div>
        </div>
      </td>
      <td>
        <span
          className="role-tag"
          data-role={user.role ?? "unknown"}
          style={{ textTransform: "capitalize" }}
        >
          {roleLabel}
        </span>
      </td>
      <td>
        <span className={`pill ${user.status === "active" ? "ingested" : "failed"}`}>
          <span className="pill-dot" />
          {user.status}
        </span>
      </td>
      <td>
        <div className="row-actions">
          {/* Deactivate/Reactivate — never on your own row (self-lockout). */}
          {!isSelf &&
            (user.status === "active" ? (
              <button
                type="button"
                className="row-act row-act-danger"
                onClick={onDeactivate}
              >
                Deactivate
              </button>
            ) : (
              <button
                type="button"
                className="row-act row-act-primary"
                onClick={onReactivate}
              >
                Reactivate
              </button>
            ))}
          {/* Edit email — available to everyone, including yourself. */}
          <button
            type="button"
            className="row-act row-act-icon"
            onClick={onEdit}
            title="Edit email"
            aria-label="Edit email"
          >
            <Pencil size={12} strokeWidth={1.6} />
          </button>
          {/* Delete — never on your own row, never on super admins. */}
          {canDelete && (
            <button
              type="button"
              className="row-act row-act-icon row-act-danger"
              onClick={onDelete}
              title="Delete user"
              aria-label="Delete user"
            >
              <Trash2 size={12} strokeWidth={1.6} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
