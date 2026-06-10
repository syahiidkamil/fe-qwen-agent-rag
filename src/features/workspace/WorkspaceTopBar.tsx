import { useLocation } from "react-router";
import { Menu } from "lucide-react";
import { UserPill } from "@/components/shared/UserPill";
import { useUiStore } from "@/stores/useUiStore";

const CRUMBS: Record<string, string> = {
  "/workspace/ai-help": "AI Help",
  "/workspace/knowledge": "Knowledge base",
};

export function WorkspaceTopBar() {
  const location = useLocation();
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav);
  const label = CRUMBS[location.pathname] ?? "Workspace";

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
        <span>Workspace</span>
        <span>/</span>
        <b>{label}</b>
      </div>
      <div className="admin-top-right">
        <UserPill />
      </div>
    </div>
  );
}
