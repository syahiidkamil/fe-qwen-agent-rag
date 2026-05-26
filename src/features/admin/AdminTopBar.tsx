import { useLocation } from "react-router";
import { UserPill } from "@/components/shared/UserPill";

const CRUMBS: Record<string, string> = {
  "/admin/cms": "Landing CMS",
  "/admin/knowledge": "Knowledge base",
  "/admin/users": "Users",
};

export function AdminTopBar() {
  const location = useLocation();
  const label = CRUMBS[location.pathname] ?? "Admin";

  return (
    <div className="admin-top">
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
