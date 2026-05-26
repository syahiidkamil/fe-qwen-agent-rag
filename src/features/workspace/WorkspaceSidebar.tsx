import { Link, useLocation, useNavigate } from "react-router";
import { LogOut, ExternalLink, Library, Sparkles, PanelLeft, PanelLeftClose } from "lucide-react";

import { useAuthStore } from "@/stores/useAuthStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useUiStore } from "@/stores/useUiStore";

export function WorkspaceSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = useConfigStore((s) => s.config);
  const email = useAuthStore((s) => s.email) ?? "you@airanext.id";
  const logout = useAuthStore((s) => s.logout);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path: string) => location.pathname.startsWith(path);
  const displayName = email.split("@")[0].split(/[._]/)[0];
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";

  return (
    <aside className="admin-side">
      <button
        type="button"
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeft size={13} strokeWidth={1.8} />
        ) : (
          <PanelLeftClose size={13} strokeWidth={1.8} />
        )}
      </button>

      <Link to="/" className="admin-side-brand">
        <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
          <rect x="1" y="1" width="24" height="24" rx="6" fill="var(--ink)" />
          <path d="M13 5L20 19H17.5L13 9.5L8.5 19H6L13 5Z" fill="#fff" />
          <circle cx="13" cy="19.5" r="2" fill="var(--teal-bright)" />
        </svg>
        <span>{config.brand}</span>
      </Link>

      <div className="admin-side-section">Workspace</div>
      <Link
        to="/workspace/ai-help"
        className="admin-side-link"
        data-active={isActive("/workspace/ai-help")}
      >
        <Sparkles className="sl-icon" />
        <span>AI Help</span>
      </Link>
      <Link
        to="/workspace/knowledge"
        className="admin-side-link"
        data-active={isActive("/workspace/knowledge")}
      >
        <Library className="sl-icon" />
        <span>Knowledge base</span>
      </Link>

      <div className="admin-side-section">Visit</div>
      <a href="/" target="_blank" rel="noopener" className="admin-side-link">
        <ExternalLink className="sl-icon" />
        <span>View public site</span>
      </a>

      <div className="admin-user">
        <div className="admin-user-av">{initial}</div>
        <div className="admin-user-meta">
          <div className="admin-user-name">{displayName || "You"}</div>
          <div className="admin-user-mail">{email}</div>
        </div>
        <button
          type="button"
          className="admin-user-logout"
          onClick={handleLogout}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={13} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
