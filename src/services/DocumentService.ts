import { api } from "@/lib/api";
import type { KbFile, KbFileStatus, KbFileType } from "@/types/file";

interface BackendDoc {
  id: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  status: KbFileStatus;
  chunk_count: number;
  error_message: string | null;
  uploaded_at: string;
}

function inferType(filename: string, mime: string | null): KbFileType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "docx" || ext === "doc") return "docx";
  if (ext === "md" || ext === "markdown") return "md";
  if (ext === "csv") return "csv";
  if (ext === "json") return "json";
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "txt") return "txt";
  if (mime?.includes("pdf")) return "pdf";
  return "file";
}

function toKbFile(d: BackendDoc): KbFile {
  return {
    id: d.id,
    name: d.filename,
    size: d.size_bytes ?? 0,
    type: inferType(d.filename, d.mime_type),
    status: d.status,
    uploaded: new Date(d.uploaded_at).toLocaleString(),
    chunks: d.chunk_count,
    progress: d.status === "ingested" ? 100 : d.status === "ingesting" ? 50 : 0,
    error: d.error_message ?? undefined,
  };
}

export const DocumentService = {
  async list(): Promise<KbFile[]> {
    const { data } = await api.get<{ data: BackendDoc[] }>("/api/documents");
    return data.data.map(toKbFile);
  },

  async upload(file: File): Promise<KbFile> {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post<{ data: BackendDoc }>("/api/documents", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return toKbFile(data.data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/documents/${id}`);
  },

  async reingest(id: string): Promise<KbFile> {
    const { data } = await api.post<{ data: BackendDoc }>(
      `/api/documents/${id}/reingest`,
    );
    return toKbFile(data.data);
  },

  async rename(id: string, filename: string): Promise<KbFile> {
    const { data } = await api.patch<{ data: BackendDoc }>(
      `/api/documents/${id}`,
      { filename },
    );
    return toKbFile(data.data);
  },
};
