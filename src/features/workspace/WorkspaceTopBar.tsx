import { useLocation } from "react-router";
import { UserPill } from "@/components/shared/UserPill";

const CRUMBS: Record<string, string> = {
  "/workspace/ai-help": "AI Help",
  "/workspace/knowledge": "Knowledge base",
};

export function WorkspaceTopBar() {
  const location = useLocation();
  const label = CRUMBS[location.pathname] ?? "Workspace";

  return (
    <div className="admin-top">
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
