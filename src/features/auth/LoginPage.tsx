import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { defaultRouteForRole } from "@/routes/RoleGuard";
import { TypingIndicator } from "@/components/chatbot/TypingIndicator";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const initialized = useAuthStore((s) => s.initialized);
  const initAuth = useAuthStore((s) => s.init);
  const brand = useConfigStore((s) => s.config.brand);
  const tagline = useConfigStore((s) => s.config.tagline);
  const loadConfig = useConfigStore((s) => s.loadFromBackend);

  useEffect(() => {
    // Direct hits to /login bypass LandingRoute, so the persisted config
    // might be stale (or wrong brand). Fire the fetch on mount; the
    // store's load-status machine handles deduping internally.
    void loadConfig();
  }, [loadConfig]);

  const misconfiguredError = useMemo(() => {
    return searchParams.get("error") === "missing_role"
      ? "This account needs setup. Contact your administrator."
      : null;
  }, [searchParams]);

  useEffect(() => {
    if (!initialized) void initAuth();
  }, [initialized, initAuth]);

  // Once the session is hydrated and we know the role, redirect or
  // sign out (for a role we can't route to).
  useEffect(() => {
    if (!initialized || !isAuthenticated) return;
    if (role === null) {
      void logout().then(() => {
        navigate("/login?error=missing_role", { replace: true });
      });
      return;
    }
    navigate(defaultRouteForRole(role), { replace: true });
  }, [initialized, isAuthenticated, role, navigate, logout]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (data: LoginValues) => {
    setSubmitting(true);
    setAuthError(null);
    try {
      await login(data.email, data.password);
      // Don't navigate here — the auth-state effect above reads the
      // hydrated role and routes by it. Avoids a flash to /admin/cms
      // for a `user`-role sign-in.
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setAuthError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrap">
      <section className="login-side">
        <div className="login-side-blobs" aria-hidden="true">
          <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="login-blob-a" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="login-blob-b" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="login-blob-c" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="120" cy="180" r="220" fill="url(#login-blob-a)" />
            <circle cx="480" cy="420" r="200" fill="url(#login-blob-b)" />
            <circle cx="320" cy="320" r="160" fill="url(#login-blob-c)" />
          </svg>
        </div>

        <svg
          className="login-side-lines"
          viewBox="0 0 600 600"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g fill="none" strokeLinecap="round">
            {/* Archimedean spiral — the "enigma" motif */}
            <path
              d="M 280.0,260.0 L 281.2,260.1 L 282.5,260.5 L 283.6,261.2 L 284.6,262.0 L 285.4,263.1 L 286.1,264.4 L 286.5,265.9 L 286.7,267.5 L 286.6,269.1 L 286.3,270.9 L 285.6,272.6 L 284.7,274.3 L 283.4,276.0 L 281.8,277.5 L 280.0,278.8 L 277.9,280.0 L 275.6,280.9 L 273.0,281.5 L 270.3,281.8 L 267.4,281.8 L 264.5,281.3 L 261.5,280.5 L 258.5,279.3 L 255.6,277.7 L 252.8,275.7 L 250.2,273.3 L 247.7,270.5 L 245.6,267.3 L 243.8,263.8 L 242.3,260.0 L 241.3,255.9 L 240.7,251.6 L 240.6,247.2 L 241.0,242.6 L 241.9,238.0 L 243.4,233.4 L 245.4,228.9 L 248.0,224.5 L 251.2,220.4 L 254.9,216.5 L 259.0,212.9 L 263.7,209.8 L 268.8,207.1 L 274.2,205.0 L 280.0,203.5 L 286.0,202.5 L 292.3,202.2 L 298.6,202.6 L 305.0,203.7 L 311.4,205.6 L 317.7,208.2 L 323.7,211.4 L 329.5,215.4 L 334.9,220.1 L 339.9,225.4 L 344.3,231.4 L 348.1,237.9 L 351.3,244.8 L 353.7,252.3 L 354.7,256.1"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="1"
            />
            {/* Flowing diagonal currents */}
            <path
              d="M -40 420 Q 180 320 360 380 T 700 280"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <path
              d="M -40 480 Q 200 380 380 440 T 700 360"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            {/* Concentric reference arcs — top-right */}
            <circle cx="540" cy="80" r="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <circle cx="540" cy="80" r="180" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <circle cx="540" cy="80" r="240" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </g>
        </svg>

        <div className="login-side-foot">
          <Link to="/" className="login-side-brand" style={{ color: "#fff" }}>
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="1"
                y="1"
                width="24"
                height="24"
                rx="6"
                fill="rgba(255,255,255,0.12)"
                stroke="rgba(255,255,255,0.2)"
              />
              <path
                d="M13 5L20 19H17.5L13 9.5L8.5 19H6L13 5Z"
                fill="#FFFFFF"
              />
              <circle cx="13" cy="19.5" r="2" fill="#1FC7AE" />
            </svg>
            <span>{brand}</span>
          </Link>

          {tagline && <p className="login-side-tagline">{tagline}</p>}
        </div>
      </section>

      <section className="login-form-side">
        <form className="login-form-card" onSubmit={handleSubmit(onSubmit)}>
          <h1>Welcome back.</h1>
          <p className="sub">Sign in to continue.</p>

          <label className="field">
            <div className="field-label">
              <span>Email</span>
            </div>
            <input
              className="input"
              type="email"
              placeholder="you@company.com"
              autoComplete="username"
              {...register("email")}
            />
            {errors.email && (
              <div className="field-error">{errors.email.message}</div>
            )}
          </label>
          <label className="field">
            <div className="field-label">
              <span>Password</span>
              <a
                href="#"
                style={{
                  color: "var(--teal-deep)",
                  textTransform: "none",
                  letterSpacing: 0,
                  fontFamily: "var(--sans)",
                  fontSize: 12,
                }}
              >
                Forgot?
              </a>
            </div>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <div className="field-error">{errors.password.message}</div>
            )}
          </label>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "4px 0 24px",
            }}
          >
            <label
              style={{
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
                fontSize: 13.5,
                color: "var(--ink-2)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                {...register("remember")}
                style={{
                  accentColor: "var(--teal)",
                  width: 14,
                  height: 14,
                }}
              />
              Keep me signed in
            </label>
          </div>

                    {(authError || misconfiguredError) && (
            <div className="field-error" style={{ marginBottom: 12 }}>
              {authError ?? misconfiguredError}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-teal"
            disabled={submitting}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "13px 20px",
              fontSize: 14.5,
            }}
          >
            {submitting ? <TypingIndicator /> : "Sign in →"}
          </button>
        </form>
      </section>
    </div>
  );
}
