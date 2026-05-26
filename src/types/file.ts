export type KbFileStatus = "uploaded" | "ingesting" | "ingested" | "failed";

export type KbFileType =
  | "pdf"
  | "docx"
  | "md"
  | "txt"
  | "csv"
  | "json"
  | "html"
  | "file";

export interface KbFile {
  id: string;
  name: string;
  size: number;
  type: KbFileType;
  status: KbFileStatus;
  uploaded: string;
  chunks: number;
  progress: number;
  error?: string;
  tags: string[];
}
