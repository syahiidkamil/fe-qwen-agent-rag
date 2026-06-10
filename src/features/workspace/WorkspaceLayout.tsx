import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { WorkspaceSidebar } from "@/features/workspace/WorkspaceSidebar";
import { WorkspaceTopBar } from "@/features/workspace/WorkspaceTopBar";
import { useUiStore } from "@/stores/useUiStore";

export function WorkspaceLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const location = useLocation();

  // Picking a nav entry should dismiss the drawer.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  // Reuse `admin-app` so the existing collapsed-sidebar CSS applies without
  // duplicating selectors. The two shells share layout — only the sidebar
  // entries differ.
  return (
    <div
      className={`admin-app${collapsed ? " is-collapsed" : ""}`}
      data-nav-open={mobileNavOpen ? "true" : undefined}
    >
      <WorkspaceSidebar />
      {mobileNavOpen && (
        <div className="admin-nav-scrim" onClick={() => setMobileNavOpen(false)} />
      )}
      <div className="admin-main">
        <WorkspaceTopBar />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
