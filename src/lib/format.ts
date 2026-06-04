export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function relativeTimeFromNow(epochMs: number): string {
  const diff = Math.max(0, Date.now() - epochMs);
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return "just now";
  if (diff < hr) return `${Math.round(diff / min)}m ago`;
  if (diff < day) return `${Math.round(diff / hr)}h ago`;
  const days = Math.round(diff / day);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return `${Math.round(days / 30)} mo ago`;
}

/**
 * Format a chat message timestamp for display on the bubble.
 *
 * Default: a human-readable wall-clock time with seconds (e.g. "3:07:42 PM").
 * With `withMillis` (admin Debug Mode): appends milliseconds (e.g.
 * "3:07:42.318 PM") so admins can see exact ordering of rapid messages.
 */
export function formatMessageTime(epochMs: number, withMillis = false): string {
  const d = new Date(epochMs);
  const base = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
  if (!withMillis) return base;
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return base.replace(/(\d{1,2}:\d{2}:\d{2})/, `$1.${ms}`);
}

export function inferFileType(name: string): import("@/types/file").KbFileType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "docx" || ext === "doc") return "docx";
  if (ext === "md" || ext === "markdown") return "md";
  if (ext === "txt") return "txt";
  if (ext === "csv") return "csv";
  if (ext === "json") return "json";
  if (ext === "html" || ext === "htm") return "html";
  return "file";
}
