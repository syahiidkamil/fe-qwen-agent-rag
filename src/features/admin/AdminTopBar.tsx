import { useLocation } from "react-router";

const CRUMBS: Record<string, string> = {
  "/admin/cms": "Landing CMS",
  "/admin/knowledge": "Knowledge base",
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
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 8px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: 99,
              background: "var(--green)",
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
          workspace · airanext
        </span>
      </div>
    </div>
  );
}
