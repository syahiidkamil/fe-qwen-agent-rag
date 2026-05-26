import { useEffect } from "react";
import { Navigate } from "react-router";
import { useConfigStore } from "@/stores/useConfigStore";
import { LandingPage } from "@/features/landing/LandingPage";

/**
 * Gate on "/". Fetches the landing config and decides between rendering
 * the public landing page or redirecting straight to /login when the
 * super-admin has set landing_hidden=true. A loader covers the fetch
 * window so we never flash the wrong UI on reload.
 *
 * Persisted localStorage state hydrates instantly, so the loader is only
 * visible during the network round-trip — on subsequent visits the
 * decision is effectively immediate.
 */
export function LandingRoute() {
  const landingHidden = useConfigStore(
    (s) => s.config.landing_hidden ?? false,
  );
  const loadStatus = useConfigStore((s) => s.loadStatus);
  const loadFromBackend = useConfigStore((s) => s.loadFromBackend);

  useEffect(() => {
    // Fire on mount regardless of current status: an old persisted
    // "loading" value (from a navigation interrupted mid-fetch) would
    // otherwise leave the route spinning forever.
    void loadFromBackend();
  }, [loadFromBackend]);

  // Block the render until the backend answers (or fails). On error we
  // fall back to local state, which is correct behavior — we treat
  // "no backend" the same as "backend says use this config".
  if (loadStatus === "idle" || loadStatus === "loading") {
    return <LandingLoader />;
  }

  if (landingHidden) {
    return <Navigate to="/login" replace />;
  }

  return <LandingPage />;
}

function LandingLoader() {
  return (
    <div className="route-loader" role="status" aria-label="Loading">
      <div className="route-loader-spinner" aria-hidden="true" />
    </div>
  );
}
