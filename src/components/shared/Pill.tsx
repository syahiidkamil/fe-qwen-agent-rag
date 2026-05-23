import { cn } from "@/lib/utils";
import type { KbFileStatus } from "@/types/file";

interface PillProps {
  status: KbFileStatus;
  showDot?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const LABELS: Record<KbFileStatus, string> = {
  uploaded: "Uploaded",
  ingesting: "Ingesting",
  ingested: "Ingested",
  failed: "Failed",
};

export function Pill({ status, showDot = true, className, children }: PillProps) {
  return (
    <span className={cn("pill", status, className)}>
      {showDot && <span className="pill-dot" aria-hidden="true" />}
      {children ?? LABELS[status]}
    </span>
  );
}
