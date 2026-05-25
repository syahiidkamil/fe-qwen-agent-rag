import { Link, useLocation, useNavigate } from "react-router";
import { LogOut, FileText, Library, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useFilesStore } from "@/stores/useFilesStore";

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = useConfigStore((s) => s.config);
  const email = useAuthStore((s) => s.email) ?? "ops@airanext.id";
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const totalFiles = useFilesStore((s) => s.files.length);
  const isSuperAdmin = role === "super_admin";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const name = email.split("@")[0].split(/[._]/)[0];
  const displayName = name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : "Staff";
  const initial = displayName.charAt(0);

  return (
    <aside className="admin-side">
      <Link to="/" className="admin-side-brand">
        <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
          <rect x="1" y="1" width="24" height="24" rx="6" fill="var(--ink)" />
          <path d="M13 5L20 19H17.5L13 9.5L8.5 19H6L13 5Z" fill="#fff" />
          <circle cx="13" cy="19.5" r="2" fill="var(--teal-bright)" />
        </svg>
        <span>{config.brand}</span>
      </Link>

      <div className="admin-side-section">Manage</div>
      {isSuperAdmin && (
        <Link
          to="/admin/cms"
          className="admin-side-link"
          data-active={isActive("/admin/cms")}
        >
          <FileText className="sl-icon" />
          <span>Landing CMS</span>
        </Link>
      )}
      <Link
        to="/admin/knowledge"
        className="admin-side-link"
        data-active={isActive("/admin/knowledge")}
      >
        <Library className="sl-icon" />
        <span>Knowledge base</span>
        <span className="sl-count">{totalFiles}</span>
      </Link>

      <div className="admin-side-section">Visit</div>
      <a href="/" target="_blank" rel="noopener" className="admin-side-link">
        <ExternalLink className="sl-icon" />
        <span>View public site</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted-2)" }}>
          ↗
        </span>
      </a>

      <div className="admin-user">
        <div className="admin-user-av">{initial}</div>
        <div className="admin-user-meta">
          <div className="admin-user-name">{displayName}</div>
          <div className="admin-user-mail">{email}</div>
        </div>
        <button
          type="button"
          className="admin-user-logout"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={13} strokeWidth={1.6} />
        </button>
      </div>
    </aside>
  );
}
