import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";

import { useAuthStore } from "@/stores/useAuthStore";

export function ProtectedRoute() {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    if (!initialized) void init();
  }, [initialized, init]);

  if (!initialized) {
    return (
      <div style={{ padding: 40, color: "var(--ink-2)", fontFamily: "var(--mono)", fontSize: 13 }}>
        Checking session…
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
