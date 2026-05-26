import { Outlet } from "react-router";
import { WorkspaceSidebar } from "@/features/workspace/WorkspaceSidebar";
import { WorkspaceTopBar } from "@/features/workspace/WorkspaceTopBar";
import { useUiStore } from "@/stores/useUiStore";

export function WorkspaceLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  // Reuse `admin-app` so the existing collapsed-sidebar CSS applies without
  // duplicating selectors. The two shells share layout — only the sidebar
  // entries differ.
  return (
    <div className={`admin-app${collapsed ? " is-collapsed" : ""}`}>
      <WorkspaceSidebar />
      <div className="admin-main">
        <WorkspaceTopBar />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
