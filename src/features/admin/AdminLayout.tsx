import { Outlet } from "react-router";
import { AdminSidebar } from "@/features/admin/AdminSidebar";
import { AdminTopBar } from "@/features/admin/AdminTopBar";

export function AdminLayout() {
  return (
    <div className="admin-app">
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
