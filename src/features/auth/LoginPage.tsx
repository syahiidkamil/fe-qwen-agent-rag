import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { TypingIndicator } from "@/components/chatbot/TypingIndicator";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/admin/cms", { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "ops@airanext.id",
      password: "demo123",
      remember: true,
    },
  });

  const onSubmit = (data: LoginValues) => {
    setSubmitting(true);
    setTimeout(() => {
      login(data.email);
      navigate("/admin/cms", { replace: true });
    }, 700);
  };

  return (
    <div className="login-wrap">
      <section className="login-side">
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
          <span>Airanext Camp</span>
        </Link>

        <h2 className="login-headline">
          Run the bootcamp.
          <br />
          Train the <em>assistant.</em>
        </h2>

        <div className="login-quote">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.4"
            aria-hidden="true"
          >
            <path d="M5 12c0-3 2-5 5-5M5 12v3c0 1 1 2 2 2h2v-5H5zM14 12c0-3 2-5 5-5M14 12v3c0 1 1 2 2 2h2v-5h-4z" />
          </svg>
          <div>
            <p>
              The admin lets us update tuition copy, drop new FAQ docs, and the
              chatbot picks them up the same day. Took our support load down by
              half.
            </p>
            <div className="who">Citra Pradana · Head of Ops, Cohort 13</div>
          </div>
        </div>

        <div className="login-side-foot">
          <span>airanext.id/admin</span>
          <span>Internal staff portal</span>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-form-top">
          Not staff?{" "}
          <Link to="/" style={{ marginLeft: 8 }}>
            Back to the public site
          </Link>
        </div>

        <form className="login-form-card" onSubmit={handleSubmit(onSubmit)}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--teal-deep)",
              marginBottom: 18,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                background: "var(--teal)",
                borderRadius: 2,
                marginRight: 8,
                verticalAlign: "middle",
              }}
            />
            Staff sign in
          </div>
          <h1>Welcome back.</h1>
          <p className="sub">
            Sign in to manage your landing page and knowledge base.
          </p>

          <label className="field">
            <div className="field-label">
              <span>Work email</span>
            </div>
            <input
              className="input"
              type="email"
              placeholder="you@airanext.id"
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

          <div className="login-demo">
            <b>Demo</b>
            <span>Any credentials work. Click sign in to enter admin.</span>
          </div>
        </form>

        <div className="login-form-foot">
          Protected by Airanext SSO ·{" "}
          <a href="#" style={{ color: "var(--teal-deep)" }}>
            View status
          </a>
        </div>
      </section>
    </div>
  );
}
