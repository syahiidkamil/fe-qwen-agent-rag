import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { LandingPage } from "@/features/landing/LandingPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { AdminLayout } from "@/features/admin/AdminLayout";
import { AdminCmsPage } from "@/features/admin/cms/AdminCmsPage";
import { AdminKnowledgePage } from "@/features/admin/knowledge/AdminKnowledgePage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/cms" replace /> },
          { path: "cms", element: <AdminCmsPage /> },
          { path: "knowledge", element: <AdminKnowledgePage /> },
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
