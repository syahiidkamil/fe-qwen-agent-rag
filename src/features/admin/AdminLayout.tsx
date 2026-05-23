import { Outlet } from "react-router";

export function AdminLayout() {
  return (
    <div style={{ padding: 48 }}>
      <h1 className="h-display-2">Admin — coming up</h1>
      <Outlet />
    </div>
  );
}
