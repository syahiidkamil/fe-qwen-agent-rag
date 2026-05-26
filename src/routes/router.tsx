import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { LandingPage } from "@/features/landing/LandingPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { AdminLayout } from "@/features/admin/AdminLayout";
import { AdminCmsPage } from "@/features/admin/cms/AdminCmsPage";
import { AdminKnowledgePage } from "@/features/admin/knowledge/AdminKnowledgePage";
import { AdminUsersPage } from "@/features/admin/users/AdminUsersPage";
import { WorkspaceLayout } from "@/features/workspace/WorkspaceLayout";
import { AiHelpPage } from "@/features/workspace/AiHelpPage";
import { UserKnowledgePage } from "@/features/workspace/UserKnowledgePage";
import { RoleGuard, defaultRouteForRole } from "@/routes/RoleGuard";
import { useAuthStore } from "@/stores/useAuthStore";

/** Sends a logged-in admin to /admin/knowledge and a super-admin to /admin/cms.
 *  Used on /admin index so direct visits don't dead-end on a route the
 *  current role can't reach. */
function AdminIndexRedirect() {
  const role = useAuthStore((s) => s.role);
  const to = role === "super_admin" ? "/admin/cms" : defaultRouteForRole(role);
  return <Navigate to={to} replace />;
}

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  // Admin shell — admin AND super_admin can enter.
  {
    element: <RoleGuard allowedRoles={["admin", "super_admin"]} />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminIndexRedirect /> },
          { path: "knowledge", element: <AdminKnowledgePage /> },
          { path: "users", element: <AdminUsersPage /> },
          // Landing CMS (brand presets + chat-mode toggle) is super-admin only.
          {
            element: <RoleGuard allowedRoles={["super_admin"]} />,
            children: [{ path: "cms", element: <AdminCmsPage /> }],
          },
        ],
      },
    ],
  },
  // Internal workspace — any signed-in role can use it. CS / sales /
  // support team lands here after sign-in; admins can navigate here
  // directly to see what their team's surface looks like.
  {
    element: <RoleGuard allowedRoles={["user", "admin", "super_admin"]} />,
    children: [
      {
        path: "/workspace",
        element: <WorkspaceLayout />,
        children: [
          { index: true, element: <Navigate to="/workspace/ai-help" replace /> },
          { path: "ai-help", element: <AiHelpPage /> },
          { path: "knowledge", element: <UserKnowledgePage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

function NotFound() {
  return (
    <div style={{ padding: 48, textAlign: "center" }}>
      <h1 className="h-display-2">404</h1>
      <p className="lede" style={{ marginTop: 16 }}>
        Page not found.
      </p>
    </div>
  );
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
