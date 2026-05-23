import type { KbFileType } from "@/types/file";

interface FileIconProps {
  type: KbFileType;
}

export function FileIcon({ type }: FileIconProps) {
  return (
    <span className="file-icon" data-type={type} aria-hidden="true">
      {type.toUpperCase()}
    </span>
  );
}
