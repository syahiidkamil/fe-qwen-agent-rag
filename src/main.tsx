import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { AppRouter } from "@/routes/router";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
    <Toaster
      position="bottom-left"
      toastOptions={{
        style: {
          background: "var(--ink)",
          color: "#fff",
          border: "1px solid var(--ink-2)",
          borderRadius: "10px",
        },
      }}
    />
  </StrictMode>,
);
