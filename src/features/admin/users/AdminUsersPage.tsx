import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUsersStore } from "@/stores/useUsersStore";
import type { ManagedUser } from "@/services/UserService";
import { AddUserDialog } from "@/features/admin/users/AddUserDialog";

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
    </>
  );
}

interface UserRowProps {
  user: ManagedUser;
  isSelf: boolean;
  onDeactivate: () => void;
  onReactivate: () => void;
}

function UserRow({ user, isSelf, onDeactivate, onReactivate }: UserRowProps) {
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
          {isSelf ? (
            <span style={{ color: "var(--muted-2)", fontSize: 12 }}>—</span>
          ) : user.status === "active" ? (
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
          )}
        </div>
      </td>
    </tr>
  );
}
