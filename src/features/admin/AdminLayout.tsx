import { Outlet } from "react-router";
import { AdminSidebar } from "@/features/admin/AdminSidebar";
import { AdminTopBar } from "@/features/admin/AdminTopBar";
import { useUiStore } from "@/stores/useUiStore";

export function AdminLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  return (
    <div className={`admin-app${collapsed ? " is-collapsed" : ""}`}>
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopBar />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
