import { Link, useLocation, useNavigate } from "react-router";
import { LogOut, Library, Sparkles, PanelLeft, PanelLeftClose } from "lucide-react";

import { useAuthStore } from "@/stores/useAuthStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useUiStore } from "@/stores/useUiStore";

export function WorkspaceSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = useConfigStore((s) => s.config);
  const logout = useAuthStore((s) => s.logout);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="admin-side">
      <div className="admin-side-header">
        <Link to="/" className="admin-side-brand">
          <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
            <rect x="1" y="1" width="24" height="24" rx="6" fill="var(--ink)" />
            <path d="M13 5L20 19H17.5L13 9.5L8.5 19H6L13 5Z" fill="#fff" />
            <circle cx="13" cy="19.5" r="2" fill="var(--teal-bright)" />
          </svg>
          <span>{config.brand}</span>
        </Link>
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
      </div>

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

      <button
        type="button"
        className="admin-side-logout"
        onClick={handleLogout}
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="sl-icon" size={16} strokeWidth={1.8} />
        <span>Sign out</span>
      </button>
    </aside>
  );
}
