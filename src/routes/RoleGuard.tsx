import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";

import { useAuthStore, type Role } from "@/stores/useAuthStore";

interface RoleGuardProps {
  allowedRoles: Role[];
}

/**
 * Where a successfully-signed-in user with this role should land by default.
 * Centralised so login, RoleGuard, and any future "go home" link agree.
 */
export function defaultRouteForRole(role: Role | null): string {
  if (role === "user") return "/workspace";
  if (role === "admin" || role === "super_admin") return "/admin/cms";
  return "/login";
}

/**
 * Route guard that enforces a role allow-list.
 *
 *  - Not yet initialised → render a small placeholder while session hydrates.
 *  - Not authenticated → redirect to /login.
 *  - Authenticated but role is missing/unknown → sign out and redirect to
 *    /login?error=missing_role (login page renders the helper text).
 *  - Authenticated with a valid role not in `allowedRoles` → redirect to
 *    the user's own default destination (don't dead-end them).
 *  - Otherwise → <Outlet />.
 */
export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const init = useAuthStore((s) => s.init);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!initialized) void init();
  }, [initialized, init]);

  // Misconfigured account: we have a session but no recognised role. Sign
  // them out so a refresh doesn't loop them back into the same broken state.
  useEffect(() => {
    if (initialized && isAuthenticated && role === null) {
      void logout();
    }
  }, [initialized, isAuthenticated, role, logout]);

  if (!initialized) {
    return (
      <div
        style={{
          padding: 40,
          color: "var(--ink-2)",
          fontFamily: "var(--mono)",
          fontSize: 13,
        }}
      >
        Checking session…
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === null) {
    return <Navigate to="/login?error=missing_role" replace />;
  }
  if (!allowedRoles.includes(role)) {
    return <Navigate to={defaultRouteForRole(role)} replace />;
  }
  return <Outlet />;
}
