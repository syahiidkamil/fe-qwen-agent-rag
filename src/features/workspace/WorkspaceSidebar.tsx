import { Link, useLocation, useNavigate } from "react-router";
import { LogOut, Library, Sparkles, PanelLeft, PanelLeftClose } from "lucide-react";

import { useAuthStore } from "@/stores/useAuthStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useUiStore } from "@/stores/useUiStore";
import { BrandMark } from "@/components/shared/BrandMark";

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
          <BrandMark size={22} />
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
