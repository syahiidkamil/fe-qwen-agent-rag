import { Link, useLocation, useNavigate } from "react-router";
import { LogOut, FileText, Library, Users, Sparkles, Sliders, PanelLeft, PanelLeftClose } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useFilesStore } from "@/stores/useFilesStore";
import { useUiStore } from "@/stores/useUiStore";
import { BrandMark } from "@/components/shared/BrandMark";

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = useConfigStore((s) => s.config);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const totalFiles = useFilesStore((s) => s.files.length);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const isSuperAdmin = role === "super_admin";

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
        to="/admin/ai-help"
        className="admin-side-link"
        data-active={isActive("/admin/ai-help")}
      >
        <Sparkles className="sl-icon" />
        <span>AI Help</span>
      </Link>
      <Link
        to="/admin/knowledge"
        className="admin-side-link"
        data-active={isActive("/admin/knowledge")}
      >
        <Library className="sl-icon" />
        <span>Knowledge base</span>
        <span className="sl-count">{totalFiles}</span>
      </Link>
      <Link
        to="/admin/users"
        className="admin-side-link"
        data-active={isActive("/admin/users")}
      >
        <Users className="sl-icon" />
        <span>Users</span>
      </Link>
      <Link
        to="/admin/system-config"
        className="admin-side-link"
        data-active={isActive("/admin/system-config")}
      >
        <Sliders className="sl-icon" />
        <span>System config</span>
      </Link>

      <button
        type="button"
        className="admin-side-logout"
        onClick={handleLogout}
        title="Sign out"
        aria-label="Sign out"
      >
        <LogOut className="sl-icon" size={16} strokeWidth={1.8} />
        <span>Sign out</span>
      </button>
    </aside>
  );
}
