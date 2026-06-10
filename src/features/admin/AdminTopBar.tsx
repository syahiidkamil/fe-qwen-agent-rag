import { useLocation } from "react-router";
import { Menu } from "lucide-react";
import { UserPill } from "@/components/shared/UserPill";
import { useUiStore } from "@/stores/useUiStore";

const CRUMBS: Record<string, string> = {
  "/admin/cms": "Landing CMS",
  "/admin/ai-help": "AI Help",
  "/admin/knowledge": "Knowledge base",
  "/admin/users": "Users",
  "/admin/system-config": "System config",
};

export function AdminTopBar() {
  const location = useLocation();
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav);
  const label = CRUMBS[location.pathname] ?? "Admin";

  return (
    <div className="admin-top">
      <button
        type="button"
        className="admin-menu-btn"
        aria-label="Open navigation"
        onClick={toggleMobileNav}
      >
        <Menu size={18} strokeWidth={1.8} />
      </button>
      <div className="crumb">
        <span>Admin</span>
        <span>/</span>
        <b>{label}</b>
      </div>
      <div className="admin-top-right">
        <UserPill />
      </div>
    </div>
  );
}
