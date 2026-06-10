import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { AdminSidebar } from "@/features/admin/AdminSidebar";
import { AdminTopBar } from "@/features/admin/AdminTopBar";
import { useUiStore } from "@/stores/useUiStore";

export function AdminLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const location = useLocation();

  // Picking a nav entry should dismiss the drawer.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  return (
    <div
      className={`admin-app${collapsed ? " is-collapsed" : ""}`}
      data-nav-open={mobileNavOpen ? "true" : undefined}
    >
      <AdminSidebar />
      {mobileNavOpen && (
        <div className="admin-nav-scrim" onClick={() => setMobileNavOpen(false)} />
      )}
      <div className="admin-main">
        <AdminTopBar />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
