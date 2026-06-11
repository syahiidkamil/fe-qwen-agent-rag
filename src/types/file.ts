// "queued" and "uploading" are client-only transient states: a freshly
// dropped file shows up immediately as "queued", flips to "uploading" when
// a slot in the upload pool picks it up, and is then replaced by the real
// server row. The backend only ever reports the latter four.
export type KbFileStatus =
  | "queued"
  | "uploading"
  | "uploaded"
  | "ingesting"
  | "ingested"
  | "failed";

export type KbFileType =
  | "pdf"
  | "docx"
  | "md"
  | "txt"
  | "csv"
  | "json"
  | "html"
  | "image"
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
