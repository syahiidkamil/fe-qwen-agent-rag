import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { LogOut } from "lucide-react";

import { useAuthStore } from "@/stores/useAuthStore";
import { useFilesStore } from "@/stores/useFilesStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { ChatWidget } from "@/components/chatbot/ChatWidget";

const CHAT_OPEN_STORAGE_KEY = "aira:workspace_chat_open";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Internal-team workspace. The `user` role lands here after sign-in; admin
 * and super-admin can also navigate here directly. Two surfaces in one
 * page: a read-only knowledge-base list (left/below) and the assistant
 * chat panel (right, auto-opened, minimizable to a floating bubble).
 *
 * Row click is intentionally a no-op for this phase — a document-preview
 * pane is future-friendly but out of scope per TASK-01-006.
 */
export function WorkspacePage() {
  const navigate = useNavigate();
  const files = useFilesStore((s) => s.files);
  const loading = useFilesStore((s) => s.loading);
  const refresh = useFilesStore((s) => s.refresh);
  const email = useAuthStore((s) => s.email) ?? "you";
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const brand = useConfigStore((s) => s.config.brand);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSignOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Workspace shows the *available* corpus — anything currently indexed
  // and queryable by the assistant. Files mid-ingest or failed are admin
  // concerns and don't belong here.
  const visibleFiles = files.filter((f) => f.status === "ingested");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--paper, #fff)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid var(--rule, var(--line))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--paper, #fff)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          to="/workspace"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 700,
            color: "var(--ink)",
            textDecoration: "none",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="24" height="24" rx="6" fill="var(--ink)" />
            <path d="M13 5L20 19H17.5L13 9.5L8.5 19H6L13 5Z" fill="#fff" />
            <circle cx="13" cy="19.5" r="2" fill="var(--teal-bright, #1FC7AE)" />
          </svg>
          <span>{brand}</span>
        </Link>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            fontSize: 13.5,
            color: "var(--ink-2)",
          }}
        >
          <span style={{ fontFamily: "var(--mono)" }}>{email}</span>
          {role && (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 9999,
                background: "var(--surface-2, #f3f5f6)",
                fontSize: 11,
                fontFamily: "var(--mono)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--ink-2)",
              }}
            >
              {role.replace("_", " ")}
            </span>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            style={{
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid var(--line, #e5e5e7)",
              background: "var(--paper, #fff)",
              cursor: "pointer",
              color: "var(--ink-2)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <LogOut size={13} strokeWidth={1.6} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px 80px",
          flex: 1,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--teal-deep, #0E8C7E)",
              marginBottom: 6,
            }}
          >
            Knowledge base
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "var(--ink)" }}>
            Documents Aira can answer from
          </h1>
          <p style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 6 }}>
            {visibleFiles.length === 0
              ? "Your admin is still curating the corpus."
              : `${visibleFiles.length} document${visibleFiles.length === 1 ? "" : "s"} indexed and ready to answer questions.`}
          </p>
        </div>

        <div
          style={{
            border: "1px solid var(--line, #e5e5e7)",
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--paper, #fff)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--surface-2, #f6f7f8)" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--ink-2)",
                    borderBottom: "1px solid var(--line, #e5e5e7)",
                  }}
                >
                  Filename
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--ink-2)",
                    borderBottom: "1px solid var(--line, #e5e5e7)",
                    width: 160,
                  }}
                >
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && visibleFiles.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    style={{ padding: "24px 16px", color: "var(--ink-2)", textAlign: "center" }}
                  >
                    Loading documents…
                  </td>
                </tr>
              ) : visibleFiles.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    style={{ padding: "24px 16px", color: "var(--ink-2)", textAlign: "center" }}
                  >
                    No documents yet — your admin is still curating the corpus. Chat still
                    works; Aira will let you know when it doesn't have a source to draw on.
                  </td>
                </tr>
              ) : (
                visibleFiles.map((f) => (
                  <tr
                    key={f.id}
                    style={{ borderTop: "1px solid var(--line, #e5e5e7)" }}
                  >
                    <td style={{ padding: "12px 16px", color: "var(--ink)" }}>{f.name}</td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--ink-2)",
                        fontFamily: "var(--mono)",
                        fontSize: 13,
                      }}
                    >
                      {formatDate(f.uploaded)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* The chat widget reuses the marketing-landing component — same
          look, same behavior — but auto-opens on mount and persists
          its open/closed preference in localStorage so the user's
          choice survives page reloads. */}
      <ChatWidget defaultOpen persistKey={CHAT_OPEN_STORAGE_KEY} />
    </div>
  );
}
